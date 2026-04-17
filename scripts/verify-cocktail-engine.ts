import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyRecipeEngine() {
  console.log("Verifying recipe engine integration for cocktails...")
  
  // 1. Get a cocktail
  const { data: products, error: cErr } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%Margarita%')

  if (cErr) {
    console.error("Error fetching cocktails:", cErr)
    return
  }

  if (!products || products.length === 0) {
    console.log("No cocktails found with name like 'Margarita'. Checking all products for names...")
    const { data: allP } = await supabase.from('products').select('name').limit(20)
    console.table(allP)
    return
  }

  console.log(`Found ${products.length} matching products:`)
  console.table(products)

  const cocktail = products[0]
  console.log(`\nChecking recipe for: ${cocktail.name} (ID: ${cocktail.id})`)

  // 2. Check recipe
  const { data: recipe, error: rErr } = await supabase
    .from('recipes')
    .select('*, inventory_items(name, unit, current_stock)')
    .eq('menu_item_id', cocktail.id)

  if (rErr) {
    console.error("Error fetching recipe:", rErr)
    return
  }

  if (!recipe || recipe.length === 0) {
    console.error("Recipe not found or empty for this product ID")
    return
  }

  console.log("Cocktail Recipe Ingredients:")
  recipe.forEach((r: any) => {
    console.log(`- ${r.inventory_items.name}: ${r.quantity_required}${r.inventory_items.unit} (Stock: ${r.inventory_items.current_stock}${r.inventory_items.unit})`)
  })
}

verifyRecipeEngine()
