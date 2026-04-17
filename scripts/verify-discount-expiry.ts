import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyExpiry() {
  console.log("--- Starting Discount Expiry Verification ---")

  // 1. Get a random menu item
  const { data: items } = await supabase.from("menu_items").select("id").limit(1)
  if (!items || items.length === 0) {
    console.error("No menu items found")
    return
  }
  const itemId = items[0].id

  // 2. Create an expired discount
  console.log("Creating an expired discount for item:", itemId)
  const { data: discount, error: createError } = await supabase
    .from("product_discounts")
    .insert({
      menu_item_id: itemId,
      discount_percentage: 10,
      start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      end_time: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      is_active: true,
      notes: "Test expired discount"
    })
    .select()
    .single()

  if (createError) {
    console.error("Error creating discount:", createError)
    return
  }
  console.log("Discount created:", discount.id)

  // 3. Verify it's NOT in active_discounts view
  const { data: active } = await supabase
    .from("active_discounts")
    .select("*")
    .eq("id", discount.id)
  
  if (active && active.length === 0) {
    console.log("SUCCESS: Discount correctly excluded from active_discounts view.")
  } else {
    console.error("FAILURE: Discount still visible in active_discounts view!")
  }

  // 4. Run deactivation function
  console.log("Running public.deactivate_expired_discounts()...")
  const { error: rpcError } = await supabase.rpc("deactivate_expired_discounts")
  
  if (rpcError) {
    console.error("Error running RPC:", rpcError)
    return
  }

  // 5. Check if is_active is now false
  const { data: updatedDiscount } = await supabase
    .from("product_discounts")
    .select("is_active")
    .eq("id", discount.id)
    .single()

  if (updatedDiscount && updatedDiscount.is_active === false) {
    console.log("SUCCESS: Discount is_active set to false by deactivation logic.")
  } else {
    console.error("FAILURE: Discount is_active still true!")
  }

  // Cleanup
  await supabase.from("product_discounts").delete().eq("id", discount.id)
  console.log("--- Verification Complete ---")
}

verifyExpiry()
