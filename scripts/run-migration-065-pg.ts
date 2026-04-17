import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

dotenv.config()

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const migrationPath = path.join(process.cwd(), "scripts", "065_enhance_pos_orders.sql")
  const migrationSql = fs.readFileSync(migrationPath, "utf8")

  console.log("Running migration 065...")
  
  const { error } = await supabase.rpc("exec_sql", { sql_query: migrationSql })

  if (error) {
    console.error("Migration failed:", error)
  } else {
    console.log("Migration 065 completed successfully")
  }
}

runMigration()
