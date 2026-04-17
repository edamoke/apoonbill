import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function updateUniqueProductImages() {
  try {
    console.log("🚀 Starting unique ultra-realistic image generation for all menu items...")

    const products = await sql`SELECT id, name FROM public.products`
    console.log(`Found ${products.length} products to update.`)

    for (let i = 0; i < products.length; i++) {
      const prod = products[i]
      const query = encodeURIComponent(prod.name)
      
      // Use distinct keyword and index-based signature to bypass caching and ensure unique results
      const uniqueImageUrl = `https://source.unsplash.com/featured/800x600?food,${query}&sig=${i}`
      
      console.log(`[${i+1}/${products.length}] Updating ${prod.name} with unique photo...`)
      
      await sql`
        UPDATE public.products 
        SET image_url = ${uniqueImageUrl}
        WHERE id = ${prod.id}
      `
    }

    console.log("✅ All product images updated with unique, realistic photos!")
  } catch (error) {
    console.error("❌ Image update failed:", error)
  } finally {
    await sql.end()
  }
}

updateUniqueProductImages()
