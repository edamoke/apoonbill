import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const sql = postgres(connectionString!, { ssl: "require" })

async function inspectPoliciesDirect() {
  try {
    console.log("Inspecting RLS policies for 'profiles' table via Direct SQL...")
    const policies = await sql`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'profiles';
    `
    console.log("Current Policies on 'profiles':")
    console.table(policies)
  } catch (err) {
    console.error("Error checking policies:", err)
  } finally {
    await sql.end()
  }
}

inspectPoliciesDirect()
