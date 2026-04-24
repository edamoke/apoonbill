import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, {
  ssl: "require",
})

async function runMigration() {
  const migrationSql = `
    -- 1. POS Shifts Table (dependency for business_days enhancement)
    CREATE TABLE IF NOT EXISTS public.pos_shifts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        staff_id UUID REFERENCES public.profiles(id) NOT NULL,
        opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        closed_at TIMESTAMP WITH TIME ZONE,
        opening_float DECIMAL(12, 2) DEFAULT 0,
        expected_cash DECIMAL(12, 2) DEFAULT 0,
        actual_cash DECIMAL(12, 2),
        variance DECIMAL(12, 2),
        status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'reconciled'
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Link orders to shifts
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shift_id') THEN
            ALTER TABLE public.orders ADD COLUMN shift_id UUID REFERENCES public.pos_shifts(id);
        END IF;
    END $$;

    -- 3. Business Days Table
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

    -- 4. Enhance pos_shifts to link to business_day
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pos_shifts' AND column_name='business_day_id') THEN
            ALTER TABLE public.pos_shifts ADD COLUMN business_day_id UUID REFERENCES public.business_days(id);
        END IF;
    END $$;

    -- 5. Function to get current server time (Machine Time)
    CREATE OR REPLACE FUNCTION public.get_server_time()
    RETURNS TIMESTAMP WITH TIME ZONE AS $$
    BEGIN
        RETURN NOW();
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 6. RLS for Business Days
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

    -- 7. RLS for POS Shifts
    ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Staff can view their own shifts" ON public.pos_shifts;
    CREATE POLICY "Staff can view their own shifts"
        ON public.pos_shifts FOR SELECT
        USING (auth.uid() = staff_id OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR role = 'accountant')
        ));

    DROP POLICY IF EXISTS "Staff can open shifts" ON public.pos_shifts;
    CREATE POLICY "Staff can open shifts"
        ON public.pos_shifts FOR INSERT
        WITH CHECK (auth.uid() = staff_id);

    DROP POLICY IF EXISTS "Managers can manage all shifts" ON public.pos_shifts;
    CREATE POLICY "Managers can manage all shifts"
        ON public.pos_shifts FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND (is_admin = true OR role = 'admin' OR role = 'accountant')
            )
        );

    -- 8. Helper function to check if a day is open
    CREATE OR REPLACE FUNCTION public.is_business_day_open()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (SELECT 1 FROM public.business_days WHERE status = 'open');
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    console.log("Applying POS Business Day and Shift schema fix...");
    await sql.unsafe(migrationSql);
    console.log("POS fix applied successfully!");
  } catch (err) {
    console.error("POS fix failed:", err);
  } finally {
    await sql.end();
  }
}

runMigration();
