import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  try {
    const migrationPath = join(process.cwd(), "scripts", "103_convert_to_grams.sql")
    const sql = readFileSync(migrationPath, "utf8")

    console.log("Running migration 103 (Convert to Grams)...")
    
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Migration failed:", error)
      process.exit(1)
    }

    console.log("Migration 103 completed successfully")
  } catch (error) {
    console.error("Error running migration:", error)
    process.exit(1)
  }
}

runMigration()
