import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL!, {
  ssl: "require",
})

async function fixDeliveryTypes() {
  try {
    const result = await sql`
      UPDATE orders 
      SET delivery_type = CASE 
          WHEN order_type = 'delivery' THEN 'delivery'
          WHEN order_type = 'pickup' THEN 'takeaway'
          WHEN order_type = 'dine_in' THEN 'dine_in'
          WHEN order_type = 'takeaway' THEN 'takeaway'
          ELSE 'delivery'
      END
      WHERE delivery_type IS NULL;
    `
    console.log("Fix applied successfully. Rows affected:", result.count)
  } catch (error) {
    console.error("Error fixing delivery types:", error)
  } finally {
    await sql.end()
  }
}

fixDeliveryTypes()
