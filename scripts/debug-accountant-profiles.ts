import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAccountant() {
  console.log("Checking for accountant profiles...")

  const { data: accountants, error } = await supabase
    .from("profiles")
    .select("*")
    .or("role.eq.accountant,is_accountant.eq.true")

  if (error) {
    console.error("Error fetching accountants:", error)
    return
  }

  console.log(`Found ${accountants?.length || 0} accountant profiles.`)
  if (accountants && accountants.length > 0) {
    accountants.forEach(a => {
      console.log(`- ${a.full_name} (${a.email}), ID: ${a.id}, Role: ${a.role}, is_accountant: ${a.is_accountant}`)
    })
  } else {
      console.log("No accountants found. This might be why they can't see orders (if they are logged in as a different role).")
  }

  // Check the specific user who is supposed to be the accountant if possible
  // Since I don't know the current user, I'll check the orders to see if any are assigned to an accountant
  const { data: assignedOrders, error: assignedError } = await supabase
    .from("orders")
    .select("assigned_accountant_id")
    .is("assigned_accountant_id", "not.null")
    .limit(5)

  if (assignedError) {
      console.error("Error checking assigned orders:", assignedError)
  } else {
      console.log("Orders with assigned accountants:", assignedOrders)
  }
}

debugAccountant()
