import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLS() {
  console.log("=== Checking Orders Table Policies ===")
  const { data: policies, error } = await supabase.rpc('exec_sql', {
    sql_query: "SELECT * FROM pg_policies WHERE tablename = 'orders';"
  })
  
  if (error) {
    console.error("Error fetching policies:", error)
  } else {
    console.log(policies)
  }
}

checkRLS()
