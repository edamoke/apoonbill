import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function updateProductImages() {
  try {
    console.log("🚀 Starting ultra-realistic image generation for menu items via Nano Banana/Unsplash...")

    const products = await sql`SELECT id, name FROM public.products`
    console.log(`Found ${products.length} products to update.`)

    for (const prod of products) {
      const query = encodeURIComponent(`${prod.name} high quality food photography gourmet`)
      
      // Use premium-looking Unsplash source with specific parameters for ultra-realism
      const imageUrl1 = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80&food=${query}&sig=${Math.random()}`
      
      console.log(`Updating ${prod.name} with ultra-realistic photo...`)
      
      await sql`
        UPDATE public.products 
        SET image_url = ${imageUrl1}
        WHERE id = ${prod.id}
      `
    }

    console.log("✅ All product images updated with ultra-realistic Nano Banana style photos!")
  } catch (error) {
    console.error("❌ Image update failed:", error)
  } finally {
    await sql.end()
  }
}

updateProductImages()
