import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function testRiderQuery() {
  try {
    console.log("🚴 Simulating Rider Query...")

    // This mimics the query in app/rider/page.tsx
    const orders = await sql`
      SELECT 
        id, status, delivery_type, created_at
      FROM public.orders 
      WHERE status IN ('ready', 'ready_for_collection', 'out_for_delivery', 'on_transit')
      ORDER BY created_at ASC;
    `

    console.log(`Found ${orders.length} orders for fulfillment board:`)
    console.table(orders)

    const specificOrder = orders.find(o => o.id.toLowerCase() === "82a2bb32-eeb5-43cd-b9f4-1bdb2cfcf322".toLowerCase())
    if (specificOrder) {
      console.log("✅ SUCCESS: Order 82A2BB32 found in query results.")
    } else {
      console.log("❌ FAILURE: Order 82A2BB32 NOT found in query results.")
      
      // Check if it exists at all with the correct status
      const [check] = await sql`SELECT id, status FROM public.orders WHERE id = '82a2bb32-eeb5-43cd-b9f4-1bdb2cfcf322'`
      if (check) {
        console.log(`Order exists with status: ${check.status}`)
      } else {
        console.log("Order does not exist in DB.")
      }
    }

  } catch (err) {
    console.error("❌ Test failed:", err)
  } finally {
    await sql.end()
  }
}

testRiderQuery()
