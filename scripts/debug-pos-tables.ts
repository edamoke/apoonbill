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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugTables() {
  const { data: tables, error } = await supabase
    .from("pos_tables")
    .select("*")
  
  if (error) {
    console.error("Error fetching tables:", error)
    return
  }

  console.log("Current Tables State:")
  console.table(tables.map((t: any) => ({
    id: t.id,
    number: t.number,
    status: t.status,
    active_order_id: t.active_order_id
  })))

  const occupiedTables = tables.filter((t: any) => t.status === 'occupied')
  for (const table of occupiedTables) {
    if (table.active_order_id) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, status, total")
        .eq("id", table.active_order_id)
        .single()
      
      console.log(`Table ${table.number} order:`, order)
      
      const { data: items } = await supabase
        .from("order_items")
        .select("id, item_name, quantity")
        .eq("order_id", table.active_order_id)
      
      console.log(`Table ${table.number} items:`, items)
    } else {
      console.log(`Table ${table.number} is occupied but has NO active_order_id!`)
    }
  }
}

debugTables()
