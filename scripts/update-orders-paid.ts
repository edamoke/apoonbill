import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function updateOrderData() {
  try {
    console.log("🚀 Updating orders to 'completed' status for real dashboard data...")
    
    // Mark all orders as completed to see revenue
    await sql`
      UPDATE public.orders 
      SET payment_status = 'completed'
      WHERE payment_status IS DISTINCT FROM 'completed'
    `
    
    console.log("✅ Orders updated successfully!")
  } catch (error) {
    console.error("❌ Update failed:", error)
  } finally {
    await sql.end()
  }
}

updateOrderData()
