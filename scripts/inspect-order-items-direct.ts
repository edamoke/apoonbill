import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
const sql = postgres(connectionString!, { ssl: "require" })

async function inspectOrderItemsDirect() {
  try {
    console.log("Inspecting 'order_items' table schema via Direct SQL...")
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
      ORDER BY column_name;
    `
    console.log("Columns in 'order_items':")
    console.table(columns)
  } catch (err) {
    console.error("Error checking columns:", err)
  } finally {
    await sql.end()
  }
}

inspectOrderItemsDirect()
