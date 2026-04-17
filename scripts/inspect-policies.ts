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

async function inspectPolicies() {
  console.log("Inspecting RLS policies for 'profiles' table...")
  
  const { data, error } = await supabase
    .rpc('exec_sql', { 
      sql_query: `
        SELECT policyname, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'profiles';
      ` 
    })

  if (error) {
    console.error("Error fetching policies:", error)
  } else {
    console.log("Current Policies on 'profiles':")
    console.table(data)
  }
}

inspectPolicies()
