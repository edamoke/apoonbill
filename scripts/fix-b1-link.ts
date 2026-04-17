import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTableAndOrder() {
  // 1. Find a recent order to link
  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_name, total")
    .order("created_at", { ascending: false })
    .limit(1)
  
  if (!orders || orders.length === 0) {
    console.log("No orders found to link.")
    return
  }

  const orderId = orders[0].id
  console.log(`Linking order ${orderId} (${orders[0].customer_name}) to table B1`)

  // 2. Link to table B1 and set as occupied
  const { error: tableError } = await supabase
    .from("pos_tables")
    .update({ 
      active_order_id: orderId,
      status: 'occupied'
    })
    .eq("number", "B1")
  
  if (tableError) {
    console.error("Error updating table:", tableError)
  } else {
    console.log("Table B1 updated successfully.")
  }

  // 3. Ensure the order is marked as 'pending' (if it was 'delivered' it might not show in active filters)
  const { error: orderError } = await supabase
    .from("orders")
    .update({ 
      status: 'pending',
      table_number: 'B1'
    })
    .eq("id", orderId)
  
  if (orderError) {
    console.error("Error updating order:", orderError)
  } else {
    console.log("Order updated to pending successfully.")
  }
}

fixTableAndOrder()
