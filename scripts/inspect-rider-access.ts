import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectRiderAccess() {
  console.log("Checking orders with all relevant data...")
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, type, delivery_type, table_number")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error:", error)
    return
  }

  console.log(`Total orders: ${orders.length}`)
  orders.forEach(o => {
      console.log(`ID: ${o.id.slice(0,8)} | Status: ${o.status.padEnd(20)} | Type: ${o.type.padEnd(10)} | DeliveryType: ${o.delivery_type.padEnd(10)} | Table: ${o.table_number || 'N/A'}`)
  })
}

inspectRiderAccess()
