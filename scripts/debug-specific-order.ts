import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkSpecificOrder() {
  const id = "5fbe117c-3b35-40b9-be2d-6b74914abd6b"
  try {
    console.log(`🔍 Checking database for Order ID: ${id}`)

    const order = await sql`SELECT * FROM public.orders WHERE id = ${id}`
    
    if (order.length === 0) {
        console.warn("❌ Order NOT FOUND in database.")
    } else {
        console.log("✅ Order FOUND:", order[0])
    }

  } catch (error) {
    console.error("❌ Debug script failed:", error)
  } finally {
    await sql.end()
  }
}

checkSpecificOrder()
