import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkSchema() {
  try {
    const res = await sql`
      SELECT 
        c.constraint_name, 
        c.check_clause
      FROM 
        information_schema.check_constraints c
    `
    console.log(res.filter(r => r.constraint_name.includes('payment_status')))

  } catch (error) {
    console.error(error)
  } finally {
    await sql.end()
  }
}

checkSchema()
