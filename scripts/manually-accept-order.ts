import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function acceptOrder() {
  const orderId = "3f213ec5-b051-42b5-aa3b-49af1afbb1ac" 
  console.log(`Manually accepting order: ${orderId}`)

  // Using 'completed' for payment_status instead of 'paid' to satisfy check constraint
  const updateData = {
    status: "approved", 
    payment_status: "completed",
    accountant_approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()

  if (error) {
    console.error("Error accepting order:", error)
    return
  }

  console.log("Order accepted successfully:", JSON.stringify(data, null, 2))
}

acceptOrder()
