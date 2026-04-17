import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testMerge() {
  console.log("Simulating mergeBills action...")

  // 1. Get Tables
  const { data: tables } = await supabase.from("pos_tables").select("*").in("number", ["B1", "B2"])
  const sourceTable = tables?.find(t => t.number === "B2")
  const targetTable = tables?.find(t => t.number === "B1")

  if (!sourceTable?.active_order_id || !targetTable?.active_order_id) {
    console.error("Tables not ready for merge. Run setup-merge-test first.")
    return
  }

  const sourceOrderId = sourceTable.active_order_id
  const targetOrderId = targetTable.active_order_id

  console.log(`Merging ${sourceOrderId} (B2) into ${targetOrderId} (B1)`)

  // 2. Move Items
  const { data: items, error: fetchErr } = await supabase.from("order_items").select("*").eq("order_id", sourceOrderId)
  if (fetchErr) console.error("Fetch items error", fetchErr)
  
  if (items && items.length > 0) {
      console.log(`Moving ${items.length} items...`)
      const { error: moveErr } = await supabase.from("order_items").update({ order_id: targetOrderId }).eq("order_id", sourceOrderId)
      if (moveErr) {
          console.error("Move items error", moveErr)
      } else {
          console.log("Items moved successfully.")
      }
  }

  // 3. Update totals
  const { data: allItems } = await supabase.from("order_items").select("price, quantity").eq("order_id", targetOrderId)
  const subtotal = allItems?.reduce((a, b) => a + (Number(b.price) * Number(b.quantity)), 0) || 0
  const total = subtotal * 1.16

  const { error: updateErr } = await supabase.from("orders").update({ subtotal, total }).eq("id", targetOrderId)
  if (updateErr) console.error("Update totals error", updateErr)

  // 4. Cancel source
  await supabase.from("orders").update({ status: 'cancelled' }).eq("id", sourceOrderId)
  
  // 5. Clear table
  await supabase.from("pos_tables").update({ active_order_id: null, status: 'available' }).eq("id", sourceTable.id)

  console.log("Merge simulation complete. Check B1 items.")
}

testMerge()
