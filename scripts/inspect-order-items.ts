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

async function inspectOrderItems() {
  console.log("Inspecting 'order_items' table schema...")
  
  // Get column information
  const { data, error } = await supabase
    .rpc('exec_sql', { 
      sql_query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'order_items';
      ` 
    })

  if (error) {
    console.error("Error fetching schema:", error)
  } else {
    console.log("Columns in 'order_items':")
    console.table(data)
  }
}

inspectOrderItems()
