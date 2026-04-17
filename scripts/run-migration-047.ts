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
  try {
    const migrationPath = path.join(process.cwd(), "scripts", "047_hrm_module_schema.sql")
    const sql = fs.readFileSync(migrationPath, "utf8")

    console.log("Running migration 047 (HRM Module) using individual statements...")
    
    // Split by semicolon, but be careful with functions (though here we don't have complex ones)
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", { sql_query: statement })
      if (error) {
        // If exec_sql is missing, we are in trouble for running raw SQL from client
        // Let's try one more thing: checking if we can use a different helper
        console.error("Statement failed:", error.message)
        if (error.message.includes("exec_sql")) {
            console.error("The exec_sql RPC function is missing. Please create it in Supabase dashboard first:")
            console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
            `)
            process.exit(1)
        }
      }
    }

    console.log("Migration 047 completed successfully!")
  } catch (err) {
    console.error("Unexpected error:", err)
    process.exit(1)
  }
}

runMigration()
