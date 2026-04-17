import postgres from "postgres"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing POSTGRES_URL environment variable")
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: "require" })

async function checkSchema() {
  try {
    console.log("Checking orders table schema...")
    const ordersColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position;
    `
    console.log("Orders columns:", ordersColumns)

    console.log("\nChecking order_items table schema...")
    const orderItemsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position;
    `
    console.log("Order items columns:", orderItemsColumns)

    console.log("\nChecking recent orders...")
    const recentOrders = await sql`
      SELECT id, created_at, status, customer_name, total
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5;
    `
    console.log("Recent orders:", recentOrders)

  } catch (err) {
    console.error("Error checking schema:", err)
  } finally {
    await sql.end()
  }
}

checkSchema()
