import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkAdminProfile() {
  const email = "edamoke@gmail.com"
  try {
    console.log(`🔍 Checking Admin profile for: ${email}`)

    const user = await sql`SELECT id, full_name, email, role, is_admin FROM public.profiles WHERE lower(email) = lower(${email})`
    console.log("Profile details:", user)

    if (user.length > 0) {
        if (!user[0].is_admin) {
            console.log("⚠️ User is NOT marked as is_admin. Fixing...")
            await sql`UPDATE public.profiles SET is_admin = true, role = 'admin' WHERE id = ${user[0].id}`
            console.log("✅ User elevated to Admin.")
        }
    } else {
        console.warn("❌ Admin profile not found.")
    }

  } catch (error) {
    console.error("❌ Debug script failed:", error)
  } finally {
    await sql.end()
  }
}

checkAdminProfile()
