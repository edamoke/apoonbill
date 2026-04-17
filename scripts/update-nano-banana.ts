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

  console.log(`Found ${products.length} products. Applying realistic Nano Banana images...`)

  for (const product of products) {
    const searchTerm = product.name.toLowerCase()
    
    // Construct Nano Banana image URL
    // Pattern: https://nano-banana.com/api/image?query=realistic+food+photography+OF+NAME+ultra+realistic+2k
    const query = encodeURIComponent(`ultra realistic 2k food photography of ${searchTerm}, professional studio lighting, high detail, appetizing`)
    const nanoBananaUrl = `https://nano-banana.com/api/image?query=${query}`

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: nanoBananaUrl,
        images: [nanoBananaUrl]
      })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Error updating product ${product.name}:`, updateError)
    } else {
      console.log(`Updated: ${product.name} with Nano Banana AI image`)
    }
  }

  console.log("Nano Banana image update complete!")
}

run()
