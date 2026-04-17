import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("Processing Suppliers...")
  const targetSuppliers = [
    { name: 'Meat & Poultry Pro', contact_person: 'Peter Kamau', category: 'Meat' },
    { name: 'Green Fresh Farms', contact_person: 'Sarah Atieno', category: 'Vegetables' },
    { name: 'Granary Essentials', contact_person: 'John Mutua', category: 'Cereals' }
  ]

  for (const s of targetSuppliers) {
    const { data } = await supabase.from("suppliers").select("id").eq("name", s.name).single()
    if (data) {
      await supabase.from("suppliers").update(s).eq("id", data.id)
    } else {
      await supabase.from("suppliers").insert(s)
    }
  }
  console.log("Suppliers processed.")

  console.log("Processing Inventory Items...")
  const targetInv = [
    { name: 'Whole Chicken', category: 'Meat', unit: 'kg', current_stock: 50.000, reorder_level: 10.000, unit_cost: 450.00 },
    { name: 'Prime Beef', category: 'Meat', unit: 'kg', current_stock: 40.000, reorder_level: 8.000, unit_cost: 600.00 },
    { name: 'Farm Eggs', category: 'Dairy', unit: 'pcs', current_stock: 360.000, reorder_level: 60.000, unit_cost: 15.00 },
    { name: 'Basmati Rice', category: 'Cereals', unit: 'kg', current_stock: 100.000, reorder_level: 20.000, unit_cost: 180.00 },
    { name: 'Yellow Beans', category: 'Cereals', unit: 'kg', current_stock: 50.000, reorder_level: 10.000, unit_cost: 140.00 },
    { name: 'Maize Flour', category: 'Cereals', unit: 'kg', current_stock: 200.000, reorder_level: 40.000, unit_cost: 80.00 },
    { name: 'Wheat Flour', category: 'Cereals', unit: 'kg', current_stock: 100.000, reorder_level: 20.000, unit_cost: 90.00 },
    { name: 'Irish Potatoes', category: 'Vegetables', unit: 'kg', current_stock: 150.000, reorder_level: 30.000, unit_cost: 60.00 },
    { name: 'Fresh Kale (Sukuma)', category: 'Vegetables', unit: 'kg', current_stock: 30.000, reorder_level: 5.000, unit_cost: 40.00 }
  ]

  for (const i of targetInv) {
    const { data } = await supabase.from("inventory_items").select("id").eq("name", i.name).single()
    if (data) {
      await supabase.from("inventory_items").update(i).eq("id", data.id)
    } else {
      await supabase.from("inventory_items").insert(i)
    }
  }
  console.log("Inventory items processed.")

  // Get IDs for linking
  const { data: finalInv } = await supabase.from("inventory_items").select("id, name")
  const { data: finalProducts } = await supabase.from("products").select("id, slug")

  const getInvId = (name: string) => finalInv?.find(i => i.name === name)?.id
  const getProdId = (slug: string) => finalProducts?.find(p => p.slug === slug)?.id

  console.log("Linking Recipes...")
  const recipes = [
    { prod: 'pilau-with-chicken', inv: 'Whole Chicken', qty: 0.250 },
    { prod: 'pilau-with-chicken', inv: 'Basmati Rice', qty: 0.150 },
    { prod: 'beef-stew', inv: 'Prime Beef', qty: 0.200 },
    { prod: 'ugali', inv: 'Maize Flour', qty: 0.250 },
    { prod: 'sukuma-wiki', inv: 'Fresh Kale (Sukuma)', qty: 0.300 },
    { prod: 'chips', inv: 'Irish Potatoes', qty: 0.400 },
    { prod: 'chapati-beans', inv: 'Wheat Flour', qty: 0.150 },
    { prod: 'american-breakfast', inv: 'Farm Eggs', qty: 2.000 },
    { prod: 'american-breakfast', inv: 'Prime Beef', qty: 0.100 },
    { prod: 'american-breakfast', inv: 'Irish Potatoes', qty: 0.200 }
  ]

  for (const r of recipes) {
    const pId = getProdId(r.prod)
    const iId = getInvId(r.inv)
    if (pId && iId) {
      const { data: exist } = await supabase.from("recipes").select("id").match({ product_id: pId, inventory_item_id: iId }).maybeSingle()
      if (exist) {
        await supabase.from("recipes").update({ quantity_required: r.qty }).eq("id", exist.id)
      } else {
        await supabase.from("recipes").insert({
          product_id: pId,
          inventory_item_id: iId,
          quantity_required: r.qty
        })
      }
    }
  }

  console.log("Migration Complete!")
}

run()
