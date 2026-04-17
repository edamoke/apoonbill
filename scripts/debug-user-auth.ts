import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

const envPath = fs.existsSync(path.resolve(process.cwd(), ".env")) 
  ? path.resolve(process.cwd(), ".env")
  : path.resolve(process.cwd(), ".env.local")
const envContent = fs.readFileSync(envPath, "utf8")

function getEnvVar(name: string): string {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL")
const supabaseServiceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugAuth() {
  const email = 'edamoke@gmail.com'
  console.log(`Debugging auth for ${email}...`)
  
  const { data: users, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    console.error("Error listing users:", userError)
    return
  }
  
  const user = users.users.find(u => u.email === email)
  if (!user) {
    console.log("User not found in auth.users")
    return
  }
  
  console.log("Auth User Data:")
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
    email_confirmed_at: user.email_confirmed_at,
    last_sign_in_at: user.last_sign_in_at
  }, null, 2))

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (profileError) {
    console.error("Error fetching profile:", profileError)
  } else {
    console.log("Public Profile Data:")
    console.log(JSON.stringify(profile, null, 2))
  }
}

debugAuth()
