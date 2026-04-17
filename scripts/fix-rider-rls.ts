import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function fixRiderRLS() {
  try {
    console.log("🛠️ Fixing Rider RLS Policies...")

    // 1. Update orders_select_staff_v7 to include 'waiter' and verify 'rider'
    // 2. Update orders_select_v7 to include 'rider'
    
    await sql`DROP POLICY IF EXISTS "orders_select_staff_v7" ON public.orders;`
    await sql`
      CREATE POLICY "orders_select_staff_v7" ON public.orders
      FOR SELECT
      TO authenticated
      USING (
        (user_id = auth.uid()) OR 
        (lower(customer_email) = lower(auth.jwt() ->> 'email')) OR 
        (EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND (profiles.role = ANY (ARRAY['admin', 'chef', 'rider', 'waiter', 'accountant', 'cashier', 'barman', 'supervisor', 'manager']) OR profiles.is_admin = true)
        ))
      );
    `

    await sql`DROP POLICY IF EXISTS "orders_select_v7" ON public.orders;`
    await sql`
      CREATE POLICY "orders_select_v7" ON public.orders
      FOR SELECT
      TO authenticated
      USING (
        (auth.uid() = user_id) OR 
        ((customer_email)::text = (auth.jwt() ->> 'email'::text)) OR 
        (EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND (profiles.role = ANY (ARRAY['admin', 'waiter', 'rider', 'cashier', 'barman', 'supervisor', 'manager', 'accountant']))
        ))
      );
    `

    console.log("✅ RLS Policies Updated.")

  } catch (err) {
    console.error("❌ Fix failed:", err)
  } finally {
    await sql.end()
  }
}

fixRiderRLS()
