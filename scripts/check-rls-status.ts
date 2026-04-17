import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const sql = postgres(connectionString!, { ssl: "require" })

async function checkRLS() {
  try {
    console.log("Checking RLS Status for key tables...")
    const rlsStatus = await sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'orders', 'order_items', 'products', 'inventory_items', 'accounting_entries');
    `
    console.log("RLS Status:", rlsStatus)

    console.log("\nChecking Profiles roles distribution...")
    const roles = await sql`
      SELECT role, count(*) 
      FROM profiles 
      GROUP BY role;
    `
    console.log("Roles distribution:", roles)

    console.log("\nChecking for any profiles with missing roles...")
    const missingRoles = await sql`
      SELECT email, role 
      FROM profiles 
      WHERE role IS NULL OR role = '';
    `
    console.log("Profiles with missing roles:", missingRoles)

    console.log("\nVerifying Manager PINs for staff...")
    const pins = await sql`
      SELECT email, role, manager_pin 
      FROM profiles 
      WHERE manager_pin IS NOT NULL;
    `
    console.log("Staff with PINs:", pins)

  } catch (err) {
    console.error("Error checking RLS:", err)
  } finally {
    await sql.end()
  }
}

checkRLS()
