import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugOrder() {
  const orderId = "3F213EC5"
  console.log(`Checking order: ${orderId}`)

  // Search by prefix
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    // .ilike("id", `${orderId}%`) // id is UUID, ilike fails
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching order:", error)
    return
  }

  if (!orders || orders.length === 0) {
    console.log("Order not found")
    return
  }

  const order = orders[0]
  console.log("Order Details:", JSON.stringify(order, null, 2))

  // Check policies
  console.log("\nChecking RLS policies for 'orders' table...")
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies', { table_name: 'orders' })
  
  if (policiesError) {
     // Fallback to manual check if RPC doesn't exist
     console.log("Could not fetch policies via RPC, please check scripts/inspect-policies-direct.ts")
  } else {
     console.log("Policies:", policies)
  }
}

debugOrder()
