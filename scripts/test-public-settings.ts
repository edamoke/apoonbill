
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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPublicAccess() {
  console.log("Testing anonymous public access to site_settings...")
  
  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("*")
  
  if (settingsError) {
    console.error("FAILED: Public access still blocked:", settingsError)
  } else {
    console.log(`SUCCESS: Publicly fetched ${settings?.length} settings`)
    console.log("Settings IDs:", settings?.map(s => s.id))
  }
}

testPublicAccess()
