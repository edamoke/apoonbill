import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function debugOrder(orderId: string) {
  try {
    console.log(`🔍 Debugging Order: ${orderId}`)

    const [order] = await sql`
      SELECT id, status, order_type, delivery_type, chef_completed_at, rider_picked_at 
      FROM public.orders 
      WHERE id = ${orderId};
    `

    if (!order) {
      console.log("❌ Order not found")
      return
    }

    console.table([order])

    console.log("\n📋 Active RLS Policies for Orders Table:")
    const policies = await sql`
      SELECT policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'orders';
    `
    console.table(policies)

  } catch (err) {
    console.error("❌ Debug failed:", err)
  } finally {
    await sql.end()
  }
}

const orderId = process.argv[2] || "82A2BB32-EEB5-43CD-B9F4-1BDB2CFCF322"
debugOrder(orderId)
