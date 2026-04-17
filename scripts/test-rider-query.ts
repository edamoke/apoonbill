import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRiderQuery() {
  console.log("=== Testing Rider Dashboard Query ===")
  
  const statuses = ["ready", "ready_for_collection", "out_for_delivery", "on_transit"]
  
  // 1. Basic query
  const { data: basic, error: e1 } = await supabase
    .from("orders")
    .select("id, status, type, delivery_type")
    .in("status", statuses)

  console.log(`Basic Query Count: ${basic?.length || 0}`)
  if (e1) console.error("E1:", e1)

  // 2. Query with relations
  const { data: rel, error: e2 } = await supabase
    .from("orders")
    .select(`
      id, status, delivery_type,
      profiles(full_name),
      order_items(id, products(name))
    `)
    .in("status", statuses)

  console.log(`Relation Query Count: ${rel?.length || 0}`)
  if (e2) console.error("E2:", e2)

  // 3. Check for specific order that might be failing
  const { data: all } = await supabase.from("orders").select("id, status, delivery_type").limit(5)
  console.log("Sample Orders (Any Status):", all)
}

testRiderQuery()
