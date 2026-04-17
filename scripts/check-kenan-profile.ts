import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkKenan() {
  try {
    console.log("🕵️ Checking profile for kenan@popnetwork.africa...")

    const [profile] = await sql`
      SELECT id, full_name, email, role, is_admin 
      FROM public.profiles 
      WHERE email = 'kenan@popnetwork.africa';
    `

    if (profile) {
      console.log("✅ Profile Found:")
      console.table([profile])
      
      if (profile.role !== 'rider') {
        console.log(`⚠️ Warning: Role is '${profile.role}', expected 'rider'. Updating...`)
        await sql`UPDATE public.profiles SET role = 'rider' WHERE id = ${profile.id}`
        console.log("✅ Role updated to 'rider'.")
      }
    } else {
      console.log("❌ Profile NOT FOUND for kenan@popnetwork.africa")
    }

  } catch (err) {
    console.error("❌ Check failed:", err)
  } finally {
    await sql.end()
  }
}

checkKenan()
