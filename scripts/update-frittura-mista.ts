import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function updateSpecificImage() {
  try {
    console.log("🚀 Updating Frittura Mista with 4K ultra-realistic photo...")

    // Specific high-quality 4K photo for fried calamari and shrimp (Frittura Mista)
    const fritturaMistaImage = "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?auto=format&fit=crop&w=1200&q=100&q=frittura-mista-seafood-fried"

    const result = await sql`
      UPDATE public.products 
      SET image_url = ${fritturaMistaImage}
      WHERE name ILIKE 'Frittura Mista'
      RETURNING name
    `

    if (result.length > 0) {
      console.log(`✅ Updated: ${result[0].name}`)
    } else {
      console.warn("⚠️ Frittura Mista not found in database.")
    }

  } catch (error) {
    console.error("❌ Image update failed:", error)
  } finally {
    await sql.end()
  }
}

updateSpecificImage()
