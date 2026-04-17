import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkAccountant() {
  try {
    console.log("🕵️ Checking profile for macpczone@gmail.com...")

    const [profile] = await sql`
      SELECT id, full_name, email, role, is_admin, is_accountant
      FROM public.profiles 
      WHERE email = 'macpczone@gmail.com';
    `

    if (profile) {
      console.log("✅ Profile Found:")
      console.table([profile])
      
      if (profile.role !== 'accountant' || !profile.is_accountant) {
        console.log(`⚠️ Warning: Role is '${profile.role}', is_accountant: ${profile.is_accountant}. Updating...`)
        await sql`UPDATE public.profiles SET role = 'accountant', is_accountant = true WHERE id = ${profile.id}`
        console.log("✅ Role updated to 'accountant' and is_accountant set to true.")
      }
    } else {
      console.log("❌ Profile NOT FOUND for macpczone@gmail.com")
    }

  } catch (err) {
    console.error("❌ Check failed:", err)
  } finally {
    await sql.end()
  }
}

checkAccountant()
