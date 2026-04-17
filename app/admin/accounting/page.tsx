import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission } from "@/app/actions/rbac-check"
import { Card } from "@/components/ui/card"
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  UtensilsCrossed, 
  ClipboardList,
  ArrowRight
} from "lucide-react"
import { AccountingOrderCard } from "@/components/admin/accounting-order-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AccountingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const canView = await hasPermission('accounting', 'view')

  if (!canView) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get pending orders that need approval
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .is("accountant_approved_at", null)
    .order("created_at", { ascending: false })

  // Get all orders for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayOrders } = await supabase.from("orders").select("*").gte("created_at", today.toISOString())

  const todayRevenue =
    todayOrders?.reduce((acc, order) => {
      if (order.payment_status === "completed" || order.status !== 'cancelled') {
        return acc + Number(order.total)
      }
      return acc
    }, 0) || 0

  const todayCOGS = todayRevenue * 0.35 

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminHeader user={user} profile={profile} />
      
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground">Accounting & ERP</h1>
              <p className="text-muted-foreground">Financial oversight and resource management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link href="/admin/accounting/reports/dashboard">
                <TrendingUp className="mr-2 h-4 w-4" />
                Executive Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* ERP Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/accounting/reports/dashboard" className="block">
            <Card className="p-4 hover:bg-accent transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Executive Financial Dashboard</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
          <Link href="/admin/accounting/reports" className="block">
            <Card className="p-4 hover:bg-accent transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-green-500" />
                <span className="font-medium">Full Accounting Reports</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-foreground mt-2">{pendingOrders?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold text-primary mt-2">Ksh {todayRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated COGS</p>
                <p className="text-3xl font-bold text-destructive mt-2">Ksh {todayCOGS.toFixed(2)}</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                <p className="text-3xl font-bold text-primary mt-2">Ksh {(todayRevenue - todayCOGS).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Pending Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold">Orders Pending Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders && pendingOrders.length > 0 ? (
              pendingOrders.map((order) => <AccountingOrderCard key={order.id} order={order} />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground col-span-full">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders pending approval</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
