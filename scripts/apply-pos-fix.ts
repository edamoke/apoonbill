import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function runMigration() {
  const migrationSql = `
    -- 1. Business Days Table
    CREATE TABLE IF NOT EXISTS public.business_days (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        closed_at TIMESTAMP WITH TIME ZONE,
        opened_by UUID REFERENCES public.profiles(id),
        closed_by UUID REFERENCES public.profiles(id),
        status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
        opening_notes TEXT,
        closing_notes TEXT,
        total_sales DECIMAL(12, 2) DEFAULT 0,
        total_cash DECIMAL(12, 2) DEFAULT 0,
        total_mpesa DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Enhance pos_shifts to link to business_day
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pos_shifts' AND column_name='business_day_id') THEN
            ALTER TABLE public.pos_shifts ADD COLUMN business_day_id UUID REFERENCES public.business_days(id);
        END IF;
    END $$;

    -- 3. Function to get current server time (Machine Time)
    CREATE OR REPLACE FUNCTION public.get_server_time()
    RETURNS TIMESTAMP WITH TIME ZONE AS $$
    BEGIN
        RETURN NOW();
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 4. RLS for Business Days
    ALTER TABLE public.business_days ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins and Accountants can manage business days" ON public.business_days;
    CREATE POLICY "Admins and Accountants can manage business days"
        ON public.business_days FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant'))
            )
        );

    DROP POLICY IF EXISTS "Everyone can view active business day" ON public.business_days;
    CREATE POLICY "Everyone can view active business day"
        ON public.business_days FOR SELECT
        USING (status = 'open' OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role IN ('admin', 'accountant'))
        ));

    -- 5. Helper function to check if a day is open
    CREATE OR REPLACE FUNCTION public.is_business_day_open()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (SELECT 1 FROM public.business_days WHERE status = 'open');
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    console.log("Applying POS Business Day schema fix...");
    await sql.unsafe(migrationSql);
    console.log("POS fix applied successfully!");
  } catch (err) {
    console.error("POS fix failed:", err);
  } finally {
    await sql.end();
  }
}

runMigration();
