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

async function createTestOrder() {
  console.log("Creating a test order for rider pickup...")

  const { data: order, error } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: "Test Customer",
        customer_phone: "1234567890",
        delivery_address: "123 Test St",
        total: 1500,
        status: "complete",
        order_type: "delivery",
        payment_status: "completed",
        user_id: "9e06ba85-fd3f-49fd-9539-0f2d0696006e" // Kenan's ID for testing visibility, but usually it's customer ID
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating test order:", error.message)
    return
  }

  console.log(`Test order created: ${order.id}, status=${order.status}`)
}

createTestOrder()
