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

// Professional Food Photography Unsplash collection IDs/Queries
const foodQueries: Record<string, string> = {
  "burger": "burger",
  "pizza": "pizza",
  "pasta": "pasta",
  "steak": "steak",
  "chicken": "chicken-food",
  "fish": "fish-dish",
  "snapper": "grilled-fish",
  "salad": "salad",
  "fries": "french-fries",
  "chips": "potato-chips",
  "juice": "fruit-juice",
  "coffee": "coffee-cup",
  "tea": "tea-cup",
  "breakfast": "breakfast",
  "tiramisu": "tiramisu",
  "cake": "cake",
  "ice cream": "ice-cream",
  "goat": "roasted-meat",
  "beef": "beef-dish",
  "stew": "stew",
  "soup": "soup",
  "rice": "cooked-rice",
  "pilau": "spiced-rice",
  "ugali": "african-food",
  "mukimo": "mashed-potatoes",
  "lobster": "lobster-dish",
  "prawns": "prawns",
  "gamberi": "shrimp",
  "seafood": "seafood",
  "beer": "beer-glass",
  "water": "water-bottle",
  "soda": "soda-can",
  "soft drink": "soft-drink"
}

const defaultUnsplash = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000"

async function run() {
  console.log("Fetching products...")
  const { data: products, error } = await supabase.from("products").select("id, name")
  
  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  console.log(`Found ${products.length} products. Updating to Unsplash images...`)

  for (const product of products) {
    let query = "food"
    const lowerName = product.name.toLowerCase()

    for (const [keyword, term] of Object.entries(foodQueries)) {
      if (lowerName.includes(keyword)) {
        query = term
        break
      }
    }

    // Generate Unsplash Source URL
    // Using the official images.unsplash.com with specific food IDs or high-quality matches
    const finalImage = `https://source.unsplash.com/featured/1000x800/?${encodeURIComponent(query)}`
    
    // Note: source.unsplash.com is being deprecated, better to use the refined search query on images.unsplash.com
    // Use a random seed based on product name to keep it consistent but realistic
    const seed = encodeURIComponent(product.name)
    const refinedUrl = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000&sig=${seed}`
    
    // Let's use a mapping to actual high-quality IDs for better realism
    const highQualityMap: Record<string, string> = {
      "burger": "1568901346375-23c9450c58cd",
      "pizza": "1513104890138-7c749659a591",
      "pasta": "1473093226795-af9932fe5856",
      "steak": "1544025162-d76694265947",
      "chicken": "1604908176997-125f25cc6f3d",
      "fish": "1580476262798-bddd9f4b7369",
      "salad": "1512621776951-a57141f2eefd",
      "juice": "1600271886742-f049cd451bba",
      "coffee": "1541167760496-162955ed8a9f",
      "tea": "1544787210-2827255ee2ee",
      "breakfast": "1525351484163-7529414344d8",
      "cake": "1578985545062-69928b1d9587",
      "tiramisu": "1571877227200-a0d98ea607e9",
      "fries": "1573016608964-b44e7edbd89a",
      "rice": "1512058564366-18510be2db19",
      "beer": "1535958636474-b021ee887b13",
      "seafood": "1551443874-987b55448b59"
    }

    let id = "1504674900247-0877df9cc836" // Default
    for (const [kw, imgId] of Object.entries(highQualityMap)) {
      if (lowerName.includes(kw)) {
        id = imgId
        break
      }
    }

    const finalUrl = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1000`

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: finalUrl,
        images: [finalUrl]
      })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Error updating product ${product.name}:`, updateError)
    } else {
      console.log(`Updated: ${product.name} with Unsplash realism`)
    }
  }

  console.log("Unsplash image update complete!")
}

run()
