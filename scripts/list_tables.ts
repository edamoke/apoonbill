
import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL!, {
  ssl: "require",
})

async function listTables() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
    console.log("Tables found:", tables.map(t => t.table_name))
  } catch (error) {
    console.error("Error listing tables:", error)
  } finally {
    await sql.end()
  }
}

listTables()
