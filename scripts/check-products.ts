import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkProducts() {
  try {
    const res = await sql`SELECT count(*), is_active FROM public.products GROUP BY is_active`
    console.log(res)
    
    const sample = await sql`SELECT name, price, image_url, is_active FROM public.products LIMIT 5`
    console.log("Sample Products:", sample)

  } catch (error) {
    console.error(error)
  } finally {
    await sql.end()
  }
}

checkProducts()
