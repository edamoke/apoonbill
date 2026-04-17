import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: ".env" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRider() {
  const email = "kenan@popnetwork.africa"
  console.log(`Checking profile for email: ${email}...`)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single()

  if (error) {
    console.error("Error fetching profile:", error.message)
    // Try searching by email in auth.users if profiles fails
    return
  }

  console.log("Profile found:", JSON.stringify(profile, null, 2))

  if (profile.role !== "rider") {
    console.log(`Updating role to 'rider' for ${email}...`)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "rider" })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Error updating role:", updateError.message)
    } else {
      console.log("Role updated successfully.")
    }
  } else {
    console.log("User already has rider role.")
  }
}

checkRider()
