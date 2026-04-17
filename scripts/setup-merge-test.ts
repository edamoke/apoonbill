import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupTables() {
  console.log("Setting up tables for testing merge logic...")

  // 1. Ensure Table B1 and B2 exist and are occupied with different orders
  const { data: tables } = await supabase.from("pos_tables").select("*").in("number", ["B1", "B2"])
  
  // Create products for orders
  const { data: products } = await supabase.from("products").select("*").limit(2)
  if (!products || products.length < 1) {
      console.error("No products found to create order items")
      return
  }
  
  if (!tables || tables.length < 2) {
      console.error("Tables B1 or B2 not found in pos_tables")
      return
  }

  const tableB1 = tables.find(t => t.number === "B1")!
  const tableB2 = tables.find(t => t.number === "B2")!

  console.log(`Table B1: ${tableB1.id}, Status: ${tableB1.status}, Order: ${tableB1.active_order_id}`)
  console.log(`Table B2: ${tableB2.id}, Status: ${tableB2.status}, Order: ${tableB2.active_order_id}`)

  // Create mock orders if they don't have them
  const mockOrders = []
  if (!tableB1.active_order_id) mockOrders.push({ table_number: "B1", status: "pending", total: 1000, subtotal: 1000 })
  if (!tableB2.active_order_id) mockOrders.push({ table_number: "B2", status: "pending", total: 500, subtotal: 500 })

  if (mockOrders.length > 0) {
      const { data: createdOrders } = await supabase.from("orders").insert(mockOrders).select()
      console.log("Created mock orders:", createdOrders)
      
      for (const order of createdOrders!) {
          const tid = order.table_number === "B1" ? tableB1.id : tableB2.id
          await supabase.from("pos_tables").update({ active_order_id: order.id, status: 'occupied' }).eq("id", tid)
          
          // Add an item to each order
          await supabase.from("order_items").insert({
              order_id: order.id,
              product_id: products[0].id,
              quantity: 1,
              price: order.total,
              item_name: products[0].name
          })
      }
  }

  console.log("Setup complete. You can now test the Merge Bills function in POS.")
}

setupTables()
