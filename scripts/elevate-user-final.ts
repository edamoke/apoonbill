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

async function elevateUser() {
  const email = 'edamoke@gmail.com'
  console.log(`Elevating ${email} in auth.users and public.profiles...`)
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error("Error listing users:", listError)
    return
  }
  
  const user = users.find(u => u.email === email)
  if (!user) {
    console.log("User not found in auth.users")
    return
  }
  
  const { data: updatedUser, error: userUpdateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      app_metadata: { role: 'admin', is_admin: true },
      user_metadata: { role: 'admin', is_admin: true }
    }
  )
  
  if (userUpdateError) {
    console.error("Error updating auth user:", userUpdateError)
  } else {
    console.log("Auth user updated successfully.")
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({ 
      role: 'admin', 
      is_admin: true,
      email_confirmed: true,
      is_suspended: false
    })
    .eq('id', user.id)
    
  if (profileUpdateError) {
    console.error("Error updating profile:", profileUpdateError)
  } else {
    console.log("Profile updated successfully.")
  }
}

elevateUser()
