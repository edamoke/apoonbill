const postgres = require("postgres")
const dotenv = require("dotenv")

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, {
  ssl: "require",
})

async function checkOrdersTable() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `
    console.log("Columns in 'orders' table:")
    console.table(columns)

    const hasCancelReason = columns.some(c => c.column_name === 'cancel_reason')
    const hasDeliveryType = columns.some(c => c.column_name === 'delivery_type')
    
    console.log("Has 'cancel_reason' column: " + hasCancelReason)
    console.log("Has 'delivery_type' column: " + hasDeliveryType)

  } catch (error) {
    console.error(error)
  } finally {
    await sql.end()
  }
}

checkOrdersTable()
