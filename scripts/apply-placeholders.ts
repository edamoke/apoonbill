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
  console.log("Fetching products...")
  const { data: products, error } = await supabase.from("products").select("id, name")
  
  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  console.log(`Found ${products.length} products. Applying placeholder images...`)

  for (const product of products) {
    // Generate a placeholder URL matching the product name
    // Using a reliable food placeholder service or just professional unsplash based on name
    const searchTerm = encodeURIComponent(product.name)
    const primaryImage = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop&sig=${searchTerm}` 
    
    // Better: use a specific placeholder that reflects the name
    const placeholderUrl = `https://placehold.co/800x600/orange/white?text=${searchTerm.replace(/%20/g, '+')}`

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: placeholderUrl,
        images: [placeholderUrl]
      })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Error updating product ${product.name}:`, updateError)
    } else {
      console.log(`Updated product: ${product.name} with placeholder`)
    }
  }

  console.log("Placeholder update complete!")
}

run()
