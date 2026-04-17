import { createClient } from "@/lib/supabase/client"

async function testOrder() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("Not logged in")
    return
  }

  console.log("Logged in as:", user.email)

  const orderData = {
    user_id: user.id,
    customer_name: "Test User",
    customer_email: user.email,
    customer_phone: "1234567890",
    delivery_address: "Test Address",
    order_type: "delivery",
    total: 1000,
    subtotal: 900,
    delivery_fee: 100,
    status: "pending",
    payment_method: "cash",
    payment_status: "pending"
  }

  console.log("Attempting to insert order via client Supabase...")
  const { data, error } = await supabase.from("orders").insert(orderData).select()

  if (error) {
    console.error("Client insertion failed:", error)
  } else {
    console.log("Client insertion succeeded:", data)
  }
}
// This needs to be run in browser console or a test page
