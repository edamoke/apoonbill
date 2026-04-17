import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WaiterFulfillmentBoard } from "@/components/staff/waiter-fulfillment-board"

export default async function RiderDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Allowed: Rider, Waiter, Admin
  const isAllowed = profile?.role === "rider" || 
                    profile?.role === "waiter" || 
                    profile?.is_admin || 
                    profile?.role === "admin"

  if (!isAllowed) {
    redirect("/dashboard")
  }

  // Get orders ready for fulfillment (delivery or dine-in collection)
  let query = supabase
    .from("orders")
    .select(`
      *,
      originator:user_id(full_name, phone),
      order_items(
        *,
        products(name)
      )
    `)
    .in("status", ["ready", "ready_for_collection", "out_for_delivery", "on_transit", "complete"])

  // Filter by role
  if (profile?.role === "rider") {
    query = query.eq("delivery_type", "delivery")
  } else if (profile?.role === "waiter") {
    query = query.eq("delivery_type", "dine_in")
  }

  const { data: orders } = await query.order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif mb-2">Fulfillment Center</h1>
          <p className="text-muted-foreground">Manage deliveries and table service collections</p>
        </div>

        <WaiterFulfillmentBoard initialOrders={orders as any || []} />
      </main>
    </div>
  )
}
