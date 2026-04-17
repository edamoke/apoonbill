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

// Mapped specific keywords to realistic food photography
const keywordToImage: Record<string, string> = {
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
  "pasta": "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1000&auto=format&fit=crop",
  "steak": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop",
  "chicken": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop",
  "fish": "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=1000&auto=format&fit=crop",
  "snapper": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop",
  "fries": "https://images.unsplash.com/photo-1573016608964-b44e7edbd89a?q=80&w=1000&auto=format&fit=crop",
  "chips": "https://images.unsplash.com/photo-1573016608964-b44e7edbd89a?q=80&w=1000&auto=format&fit=crop",
  "juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000&auto=format&fit=crop",
  "coffee": "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=1000&auto=format&fit=crop",
  "tea": "https://images.unsplash.com/photo-1544787210-2827255ee2ee?q=80&w=1000&auto=format&fit=crop",
  "breakfast": "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop",
  "tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop",
  "cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop",
  "ice cream": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=1000&auto=format&fit=crop",
  "goat": "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop",
  "beef": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop",
  "stew": "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop",
  "pilau": "https://images.unsplash.com/photo-1633945274405-b6c80a9037c2?q=80&w=1000&auto=format&fit=crop",
  "ugali": "https://images.unsplash.com/photo-1622325363715-9988a7051410?q=80&w=1000&auto=format&fit=crop",
  "mukimo": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
  "lobster": "https://images.unsplash.com/photo-1553163147-622ab57b202e?q=80&w=1000&auto=format&fit=crop",
  "prawns": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop",
  "gamberi": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop",
  "seafood": "https://images.unsplash.com/photo-1551443874-987b55448b59?q=80&w=1000&auto=format&fit=crop",
  "beer": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1000&auto=format&fit=crop",
  "water": "https://images.unsplash.com/photo-1523362622602-d213a8a0b3f0?q=80&w=1000&auto=format&fit=crop",
  "soda": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop",
  "soft drink": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000&auto=format&fit=crop"
}

const fallbackFood = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"

async function run() {
  console.log("Fetching products...")
  const { data: products, error } = await supabase.from("products").select("id, name")
  
  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  console.log(`Found ${products.length} products. Updating to realistic images...`)

  for (const product of products) {
    let finalImage = fallbackFood
    const lowerName = product.name.toLowerCase()

    // Find the best matching image based on keyword priority
    for (const [keyword, url] of Object.entries(keywordToImage)) {
      if (lowerName.includes(keyword)) {
        finalImage = url
        break
      }
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: finalImage,
        images: [finalImage]
      })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Error updating product ${product.name}:`, updateError)
    } else {
      console.log(`Updated: ${product.name} -> ${finalImage.substring(0, 40)}...`)
    }
  }

  console.log("Realistic image update complete!")
}

run()
