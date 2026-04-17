import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  const migrationPath = path.join(process.cwd(), "scripts", "037_pos_and_suppliers_schema.sql")
  const sql = fs.readFileSync(migrationPath, "utf8")

  console.log("Running migration 037...")

  const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

  if (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }

  console.log("Migration 037 completed successfully")
}

runMigration()
