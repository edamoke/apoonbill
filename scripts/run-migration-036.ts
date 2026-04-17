import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  const migrationPath = path.join(process.cwd(), "scripts", "036_inventory_and_erp_schema.sql")
  const sql = fs.readFileSync(migrationPath, "utf8")

  console.log("Running migration 036...")

  // We use the RPC call to execute SQL since the client doesn't have a direct .sql() method
  // This requires the 'exec_sql' function to exist (created in script 000)
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

  if (error) {
    console.error("Error running migration:", error)
    process.exit(1)
  }

  console.log("Migration 036 completed successfully")
}

runMigration()
