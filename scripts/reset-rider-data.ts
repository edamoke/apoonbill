import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAndFix() {
  console.log("Resetting statuses and fixing delivery_type...")
  
  // 1. Mark some orders as delivery + ready
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, type, delivery_type")
    .limit(3)

  if (orders) {
      for (const order of orders) {
          console.log(`Updating ${order.id.slice(0,8)}...`)
          await supabase.from("orders").update({
              status: 'ready',
              delivery_type: 'delivery',
              type: 'delivery'
          }).eq("id", order.id)
      }
  }

  console.log("Done. Please refresh the rider page.")
}

resetAndFix()
