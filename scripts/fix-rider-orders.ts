import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRiderOrders() {
  console.log("Updating delivery orders to 'ready' status...")
  
  // We want to make sure 'delivery' orders are visible to riders.
  // The rider page filters by ["ready", "ready_for_collection", "out_for_delivery", "on_transit"]
  
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: 'ready' })
    .eq("type", "delivery")
    .in("status", ["pending", "confirmed", "processing"])

  if (error) {
    console.error("Error:", error)
    return
  }

  console.log("Successfully updated delivery orders to 'ready' status.")
  
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, type")
    .eq("type", "delivery")
  
  console.log("Current Delivery Orders Status:")
  orders?.forEach(o => console.log(`- ${o.id.slice(0,8)}: ${o.status}`))
}

fixRiderOrders()
