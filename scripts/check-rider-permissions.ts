import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function checkRiderPermissions() {
  try {
    console.log("🕵️ Checking Rider Profile and Permissions...")

    // 1. Find a rider profile
    const riders = await sql`
      SELECT id, full_name, role, is_admin 
      FROM public.profiles 
      WHERE role = 'rider' OR role = 'waiter'
      LIMIT 5;
    `
    console.log("Available Riders/Waiters:")
    console.table(riders)

    if (riders.length === 0) {
      console.log("❌ No rider profiles found to test with.")
      return
    }

    // 2. Test RLS for a specific rider
    const testRiderId = riders[0].id
    console.log(`\n🧪 Testing RLS for Rider ID: ${testRiderId} (${riders[0].full_name})`)

    // We simulate the RLS check by running a query as if we were that user
    // In local postgres we can use SET ROLE or session variables, but here we'll just check the logic manually against the policy
    
    const [order] = await sql`SELECT * FROM public.orders WHERE id = '82a2bb32-eeb5-43cd-b9f4-1bdb2cfcf322'`
    console.log("\nTarget Order Data:")
    console.table([{
        id: order.id,
        status: order.status,
        user_id: order.user_id,
        customer_email: order.customer_email
    }])

    console.log("\nConclusion:")
    console.log("If the rider can't see it in the app, it is almost certainly RLS.")
    console.log("Policy 'orders_select_staff_v7' allows SELECT if:")
    console.log(" - user_id = auth.uid()")
    console.log(" - customer_email = auth.email")
    console.log(" - auth user profile role is in ['admin', 'chef', 'rider', 'accountant', 'cashier', 'waitress']")
    
    console.log("\nWait... the array has 'waitress' but not 'waiter' in 'orders_select_staff_v7'!")
    console.log("And 'orders_select_v7' has 'waiter' but NOT 'rider'!")

  } catch (err) {
    console.error("❌ Permission check failed:", err)
  } finally {
    await sql.end()
  }
}

checkRiderPermissions()
