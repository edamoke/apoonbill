import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, UtensilsCrossed, ClipboardList, History as HistoryIcon } from "lucide-react"
import { AdminOrdersDashboard } from "@/components/admin/admin-orders-dashboard"
import { AdminOrdersFilter } from "@/components/admin/admin-orders-filter"

export default async function AdminOrdersPage({
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
    profile?.role === 'accountant' ||
    profile?.role === 'hrm'

  if (!isAllowed) {
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

  // Default filter for main tracker: EXCLUDE completed and delivered
  if (!params.status) {
    query = query.not("status", "in", '("completed","delivered","cancelled")')
  }

  const { data: orders } = await query.order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-500"
      case "on_transit":
        return "bg-blue-500/10 text-blue-500"
      case "processing":
        return "bg-yellow-500/10 text-yellow-500"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2">Order Management</h1>
            <p className="text-muted-foreground">Track and manage active orders</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="text-[#2d5a4a] border-[#2d5a4a] hover:bg-[#2d5a4a] hover:text-white">
              <Link href="/admin/orders/history">
                <HistoryIcon className="mr-2 h-4 w-4" />
                Order Audit
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/inventory/recipes">
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Recipes
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/captain-orders">
                <ClipboardList className="mr-2 h-4 w-4" />
                Captain Orders
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
