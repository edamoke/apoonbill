import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { History } from "lucide-react"
import { AdminOrdersDashboard } from "@/components/admin/admin-orders-dashboard"
import { AdminOrdersFilter } from "@/components/admin/admin-orders-filter"

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    status?: string; 
    search?: string;
    type?: string;
    payment?: string;
    source?: string;
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAllowed = 
    profile?.is_admin || 
    profile?.role === 'admin' || 
    profile?.is_accountant || 
    profile?.role === 'accountant'

  if (!isAllowed) {
    redirect("/dashboard")
  }

  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  // Base query for history: COMPLETED or DELIVERED orders
  let query = adminSupabase
    .from("orders")
    .select("*")
    .in("status", ["completed", "delivered", "cancelled"])

  if (params.status) {
    query = query.eq("status", params.status)
  }

  if (params.type) {
    query = query.eq("order_type", params.type)
  }

  if (params.payment) {
    query = query.eq("payment_method", params.payment)
  }

  if (params.source) {
    query = query.eq("source", params.source)
  }

  if (params.search) {
    query = query.or(`customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`)
  }

  const { data: orders } = await query.order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2">Order Audit & History</h1>
            <p className="text-muted-foreground">Archive of fulfilled, delivered, and cancelled orders</p>
          </div>
          <div>
            <Button asChild variant="outline">
              <Link href="/admin/orders">
                Active Orders
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AdminOrdersFilter />

        {/* Orders List */}
        <AdminOrdersDashboard initialOrders={orders || []} />
      </main>
    </div>
  )
}
