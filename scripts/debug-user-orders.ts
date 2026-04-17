import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkUserOrders() {
  const email = "eamy16@hotmail.com"
  try {
    console.log(`🔍 Checking orders and profile for: ${email}`)

    const user = await sql`SELECT id, full_name, role, is_admin FROM public.profiles WHERE lower(email) = lower(${email})`
    console.log("Profile details:", user)

    const orders = await sql`SELECT id, created_at, status, total, order_type FROM public.orders WHERE lower(customer_email) = lower(${email}) OR user_id = ANY(${user.map(u => u.id)}) ORDER BY created_at DESC`
    console.log(`Orders found (${orders.length}):`, orders)

    if (orders.length > 0) {
        const items = await sql`SELECT id, order_id, item_name, quantity FROM public.order_items WHERE order_id = ${orders[0].id}`
        console.log(`Items for most recent order (${orders[0].id}):`, items)
    }

  } catch (error) {
    console.error("❌ Debug script failed:", error)
  } finally {
    await sql.end()
  }
}

checkUserOrders()
