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

// Mapped real food photography terms to high-quality Unsplash images
const foodCategoryImages: Record<string, string[]> = {
  "Juice": [
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1621506289937-4c721a311b1e?auto=format&fit=crop&q=80&w=800"
  ],
  "Water": [
    "https://images.unsplash.com/photo-1523362622602-d213a8a0b3f0?auto=format&fit=crop&q=80&w=800"
  ],
  "Coffee": [
    "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800"
  ],
  "Tea": [
    "https://images.unsplash.com/photo-1544787210-2827255ee2ee?auto=format&fit=crop&q=80&w=800"
  ],
  "Goat": [
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800"
  ],
  "Beef": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
  ],
  "Chicken": [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=800"
  ],
  "Salad": [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
  ],
  "Burger": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
  ],
  "Beer": [
    "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800"
  ],
  "Rice": [
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800"
  ],
  "Pilau": [
    "https://images.unsplash.com/photo-1633945274405-b6c80a9037c2?auto=format&fit=crop&q=80&w=800"
  ],
  "Fish": [
    "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800"
  ],
  "Snapper": [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800"
  ],
  "Breakfast": [
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800"
  ],
  "Chapati": [
    "https://images.unsplash.com/photo-1505253149610-ee9b9df9cf85?auto=format&fit=crop&q=80&w=800"
  ],
  "Pizza": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"
  ],
  "Tiramisu": [
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800"
  ],
  "Pasta": [
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800"
  ],
  "Chips": [
    "https://images.unsplash.com/photo-1573016608964-b44e7edbd89a?auto=format&fit=crop&q=80&w=800"
  ],
  "Patatine": [
    "https://images.unsplash.com/photo-1573016608964-b44e7edbd89a?auto=format&fit=crop&q=80&w=800"
  ],
  "Lobster": [
    "https://images.unsplash.com/photo-1553163147-622ab57b202e?auto=format&fit=crop&q=80&w=800"
  ],
  "Gamberi": [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800"
  ],
  "Prawns": [
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800"
  ],
  "Dessert": [
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800"
  ],
  "Cake": [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800"
  ],
  "Ice Cream": [
    "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=800"
  ]
}

const defaultFoodImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"

async function run() {
  console.log("Fetching products...")
  const { data: products, error } = await supabase.from("products").select("id, name, slug")
  
  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  console.log(`Found ${products.length} products. Applying realistic images...`)

  for (const product of products) {
    let selectedImages = [defaultFoodImage]
    
    // Search for matching category image
    for (const [key, imgs] of Object.entries(foodCategoryImages)) {
      if (product.name.toLowerCase().includes(key.toLowerCase())) {
        selectedImages = imgs
        break
      }
    }

    const primaryImage = selectedImages[0]

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: primaryImage,
        images: selectedImages
      })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Error updating product ${product.name}:`, updateError)
    } else {
      console.log(`Updated product: ${product.name} with image: ${primaryImage}`)
    }
  }

  console.log("Realistic image update complete!")
}

run()
