
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { resolve } from "path"
import fs from "fs"

// Load .env manually
const envPath = resolve(process.cwd(), ".env")
const envConfig = dotenv.parse(fs.readFileSync(envPath))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables", { 
    supabaseUrl: !!supabaseUrl, 
    supabaseServiceKey: !!supabaseServiceKey,
    url: supabaseUrl 
  })
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugSettings() {
  console.log("Checking site_settings table...")
  
  // Check if we can fetch settings with service role
  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("*")
  
  if (settingsError) {
    console.error("Error fetching settings with service role:", settingsError)
  } else {
    console.log(`Successfully fetched ${settings?.length} settings with service role`)
    console.log("Settings IDs:", settings?.map(s => s.id))
  }

  // Check user edamoke@gmail.com
  console.log("\nChecking user edamoke@gmail.com in profiles...")
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", "edamoke@gmail.com")
    .single()

  if (userError) {
    console.error("Error fetching profile for edamoke@gmail.com:", userError)
  } else {
    console.log("Profile data:", userData)
  }
}

debugSettings()
