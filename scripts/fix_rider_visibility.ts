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

async function fixRiderVisibility() {
  console.log("Fixing order statuses for rider visibility...")

  // Update 'complete' orders to 'ready' if they are delivery and unassigned
  const { data: updatedReady, error: errorReady } = await supabase
    .from("orders")
    .update({ status: "ready" })
    .eq("status", "complete")
    .eq("order_type", "delivery")
    .is("assigned_rider_id", null)
    .select()

  if (errorReady) {
    console.error("Error updating to ready:", errorReady.message)
  } else {
    console.log(`Updated ${updatedReady.length} orders to 'ready' status.`)
  }

  // Also ensure Kenan's profile has all necessary flags
  const kenanEmail = "kenan@popnetwork.africa"
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ 
      role: "rider",
      is_rider: true,
      email_confirmed: true 
    })
    .eq("email", kenanEmail)
    .select()

  if (profileError) {
    console.error("Error updating Kenan's profile:", profileError.message)
  } else {
    console.log("Updated Kenan's profile flags.")
  }
}

fixRiderVisibility()
