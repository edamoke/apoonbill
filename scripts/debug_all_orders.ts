import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugAllOrders() {
  console.log("Checking all orders in the system...")

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, order_type, assigned_rider_id, customer_name")

  if (error) {
    console.error("Error fetching orders:", error.message)
    return
  }

  console.log(`Total orders found: ${orders.length}`)
  orders.forEach(o => {
    console.log(`- Order ${o.id.slice(0, 8)}: status=${o.status}, type=${o.order_type}, rider=${o.assigned_rider_id || 'unassigned'}, customer=${o.customer_name}`)
  })
}

debugAllOrders()
