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

async function debugRider() {
  const email = "kenan@popnetwork.africa"
  console.log(`Debugging rider visibility for: ${email}`)

  // 1. Get Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single()

  if (profileError) {
    console.error("Profile error:", profileError.message)
    return
  }

  console.log("Profile details:", {
    id: profile.id,
    role: profile.role,
    is_rider: profile.is_rider,
    email_confirmed: profile.email_confirmed
  })

  // 2. Check Available Orders (Ready for pickup)
  const { data: availableOrders, error: availableError } = await supabase
    .from("orders")
    .select("id, status, assigned_rider_id, order_type")
    .eq("status", "ready")
    .is("assigned_rider_id", null)
    .eq("order_type", "delivery")

  if (availableError) {
    console.error("Available orders error:", availableError.message)
  } else {
    console.log(`Found ${availableOrders.length} available delivery orders ready for pickup.`)
    if (availableOrders.length > 0) {
      console.log("Sample available order:", availableOrders[0])
    }
  }

  // 3. Check Assigned Orders
  const { data: assignedOrders, error: assignedError } = await supabase
    .from("orders")
    .select("id, status, assigned_rider_id")
    .eq("assigned_rider_id", profile.id)

  if (assignedError) {
    console.error("Assigned orders error:", assignedError.message)
  } else {
    console.log(`Found ${assignedOrders.length} orders assigned to this rider.`)
    if (assignedOrders.length > 0) {
      console.log("Assigned orders statuses:", assignedOrders.map(o => o.status))
    }
  }

  // 4. Check RLS context
  console.log("\nRLS Check Plan:")
  console.log("Rider is querying for status 'ready' AND assigned_rider_id IS NULL AND order_type = 'delivery'")
  console.log("OR status IN ['ready', 'out_for_delivery', 'delivered'] AND assigned_rider_id = rider_id")
}

debugRider()
