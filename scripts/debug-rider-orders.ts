import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectOrders() {
  console.log("Fetching orders...")
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, type, delivery_address, created_at, total")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error:", error)
    return
  }

  console.log(`Total orders found: ${orders.length}`)
  orders.forEach(o => {
      console.log(`ID: ${o.id.slice(0,8)} | Status: ${o.status.padEnd(20)} | Type: ${o.type.padEnd(10)} | Total: ${o.total} | Address: ${o.delivery_address || 'N/A'}`)
  })
}

inspectOrders()
