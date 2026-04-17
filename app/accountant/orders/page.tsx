import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UtensilsCrossed, ClipboardList, LayoutDashboard } from "lucide-react"
import { AdminOrdersDashboard } from "@/components/admin/admin-orders-dashboard"
import { AdminOrdersFilter } from "@/components/admin/admin-orders-filter"

export default async function AccountantOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    status?: string; 
    search?: string;
    type?: string;
    payment?: string;
    source?: string;
    view?: string;
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
    console.log("[Accountant Orders] Access denied. Profile:", profile);
    redirect("/dashboard")
  }

  // Use admin client for fetching to ensure visibility regardless of RLS issues
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  // Get orders with filters
  let query = adminSupabase.from("orders").select("*")

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
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Stable Accountant Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - Orders Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2">Order Management</h1>
            <p className="text-muted-foreground">View and manage all orders</p>
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
