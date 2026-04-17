
import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const envPath = fs.existsSync(path.resolve(process.cwd(), ".env")) 
  ? path.resolve(process.cwd(), ".env")
  : path.resolve(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf8")

function getEnvVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "scripts/077_flat_admin_fix.sql"), "utf8")
  const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })
  
  if (error) {
    console.error("Migration failed:", error)
  } else {
    console.log("Flat Admin Fix applied successfully!")
  }
}

runMigration()
