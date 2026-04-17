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

// Professional Food Photography Unsplash collection terms
const foodPhoto = (query: string) => [
  `https://images.unsplash.com/photo-${query}?auto=format&fit=crop&q=80&w=800`,
  `https://images.unsplash.com/photo-${query}-2?auto=format&fit=crop&q=80&w=800`,
  `https://images.unsplash.com/photo-${query}-3?auto=format&fit=crop&q=80&w=800`
]

// Specifically mapped high-end food photography IDs from Unsplash
const productImages: Record<string, string[]> = {
  "Mixed Tea": [
    "https://images.unsplash.com/photo-1544787210-2827255ee2ee?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1594631252845-29fc458695d7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1563911191283-d4855011f67e?auto=format&fit=crop&q=80&w=800"
  ],
  "Lemon Tea": [
    "https://images.unsplash.com/photo-1512533314113-fdf6da83e589?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
  ],
  "Coffee Latte": [
    "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800"
  ],
  "Swahili Breakfast": [
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800"
  ],
  "American Breakfast": [
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1484723088339-0b28382d5938?auto=format&fit=crop&q=80&w=800"
  ],
  "The Scrambler": [
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1484723088339-0b28382d5938?auto=format&fit=crop&q=80&w=800"
  ],
  "Grilled Red Snapper": [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1534604973900-c41ab4cdd90b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800"
  ],
  "Seafood Grill Platter": [
    "https://images.unsplash.com/photo-1551443874-987b55448b59?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1514516322520-57c40c8f1c21?auto=format&fit=crop&q=80&w=800"
  ],
  "Cheese Burger": [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800"
  ],
  "Stars and Garter Burger": [
    "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=800"
  ],
  "Ossobuco": [
    "https://images.unsplash.com/photo-1622325363715-9988a7051410?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1616030846238-c89a0b7232a8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800"
  ],
  "French Fries": [
    "https://images.unsplash.com/photo-1573016608964-b44e7edbd89a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1630384066252-19e1ad95b4f6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1526230427044-d092040d48ac?auto=format&fit=crop&q=80&w=800"
  ],
  "Pizza": [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=800"
  ],
  "Tiramisu": [
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1614707767320-2b56ba4095af?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1543508911-28cf8a9a0417?auto=format&fit=crop&q=80&w=800"
  ],
  "Pasta": [
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
  ],
  "Meat": [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800"
  ],
  "Chicken": [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800"
  ],
  "Pilau": [
    "https://images.unsplash.com/photo-1633945274405-b6c80a9037c2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1631515223380-c11720d141b1?auto=format&fit=crop&q=80&w=800"
  ],
  "Ugali": [
    "https://images.unsplash.com/photo-1626082896492-766af4eb6501?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1633945274405-b6c80a9037c2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1622325363715-9988a7051410?auto=format&fit=crop&q=80&w=800"
  ],
  "Tilapia": [
    "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800"
  ],
  "Mukimo": [
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
  ],
  "Goat": [
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
  ],
  "Dessert": [
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800"
  ],
  "Juice": [
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1536816579748-4fcb33e5340f?auto=format&fit=crop&q=80&w=800"
  ]
}

const originalProductMap: Record<string, string> = {
  "grilled-potatoes-bacon-kale": "/images/pxl-20251209-120738148.jpg",
  "chocolate-crepes": "/images/pxl-20251209-114620748.jpg",
  "lentil-greens-bowl": "/images/pxl-20251209-125043384.jpg",
  "grilled-beef-steak": "/images/pxl-20251209-115126549-20-28custom-29.jpg",
  "mixed-grill-plate": "/images/pxl-20251209-123652576.jpg",
  "gourmet-grill-platter": "/images/pxl-20251209-123701932.jpg",
  "crispy-sweet-potato-fries": "/images/pxl-20251209-115244688.jpg",
  "legumes-kale-medley": "/images/pxl-20251209-125642606.jpg"
}

const defaultImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800"
]

async function run() {
  console.log("Fetching products...")
  const { data: products, error } = await supabase.from("products").select("id, name, slug, image_url")
  
  if (error) {
    console.error("Error fetching products:", error)
    return
  }

  console.log(`Found ${products.length} products. Updating images...`)

  for (const product of products) {
    let selectedImages = [...defaultImages]
    let primaryImage = null

    // 1. Prioritize original high-quality local images explicitly
    if (originalProductMap[product.slug]) {
       primaryImage = originalProductMap[product.slug]
       console.log(`RESTORING original local image for: ${product.name} -> ${primaryImage}`)
    } 
    // 2. Otherwise check if it's already a local image (start with /images/)
    else if (product.image_url?.startsWith("/images/")) {
       primaryImage = product.image_url
       console.log(`KEEPING existing local image for: ${product.name}`)
    }

    // If we found a local image, put it first in the array
    if (primaryImage) {
       selectedImages = [primaryImage, ...selectedImages.slice(0, 2)]
    } else {
       // Only apply professional food photography if no local image exists
       for (const [key, imgs] of Object.entries(productImages)) {
         if (product.name.toLowerCase().includes(key.toLowerCase())) {
           selectedImages = imgs
           break
         }
       }
       primaryImage = selectedImages[0]
    }

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
      console.log(`Updated product: ${product.name} (Primary: ${primaryImage})`)
    }
  }

  console.log("Migration complete!")
}

run()
