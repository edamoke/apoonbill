import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugRiderBoard() {
  console.log("=== Debugging Rider Board Data ===")
  
  // 1. Fetch exactly like the component
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        products(name)
      )
    `)
    .in("status", ["ready", "ready_for_collection", "out_for_delivery", "on_transit"])
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Query Error:", error)
  } else {
    console.log(`Component-style query found: ${orders?.length || 0} orders`)
    orders?.forEach(o => {
        console.log(`- ID: ${o.id.slice(0,8)} | Status: ${o.status} | DeliveryType: ${o.delivery_type} | Customer: ${o.customer_name}`)
    })
  }

  // 2. Check if delivery_type is maybe missing for some?
    const { data: allReady } = await supabase
      .from("orders")
      .select("id, status, delivery_type, order_type")
      .in("status", ["ready", "ready_for_collection"])
    
    console.log("\nAll 'ready' orders in DB:")
    allReady?.forEach(o => {
        console.log(`- ID: ${o.id.slice(0,8)} | Status: ${o.status} | OrderType: ${o.order_type} | DeliveryType: ${o.delivery_type}`)
    })
}

debugRiderBoard()
