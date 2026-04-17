import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function auditInventory() {
  console.log("Auditing inventory for cocktail ingredients...")
  
  const { data: items, error } = await supabase
    .from('inventory_items')
    .select('name, unit, current_stock')
    .ilike('category', '%Bar%')

  if (error) {
    console.error("Error fetching inventory items:", error)
    return
  }

  console.log("Current Bar Inventory Items:")
  console.table(items)

  const { data: allItems, error: allErr } = await supabase
    .from('inventory_items')
    .select('name, unit, category')
  
  if (allErr) {
    console.error("Error fetching all inventory items:", allErr)
    return
  }

  console.log("\nAll Inventory Items (to check for misplaced ingredients):")
  console.table(allItems)
}

auditInventory()
