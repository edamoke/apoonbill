import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { 
  Users, Package, ShoppingCart, DollarSign, ChefHat, Bike, 
  CheckCircle, TrendingUp, AlertTriangle, Clock, Utensils, 
  ArrowUpRight, ArrowDownRight, MoreVertical 
} from "lucide-react"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import { format, subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LowStockAlerts } from "@/components/admin/low-stock-alerts"
import { StockCountDialog } from "@/components/admin/stock-count-dialog"
import { ShiftReportDialog } from "@/components/admin/shift-report-dialog"

async function getStats(supabase: any) {
  // 1. Basic Counts
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })
  
  // 2. Revenue (Real) - Support multiple completion statuses
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total, created_at")
    .in("payment_status", ["completed", "paid"])
  
  const totalRevenue = revenueData?.reduce((acc: number, order: any) => acc + Number(order.total), 0) || 0

  // 3. Status Counts
  const { count: pendingOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending")
  const { count: cookingOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "cooking")
  
  // 4. Chart Data: Revenue Trend (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(new Date(), i)
    return {
      date: format(d, 'MMM dd'),
      amount: revenueData
        ?.filter((o: any) => format(new Date(o.created_at), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
        .reduce((acc: number, curr: any) => acc + Number(curr.total), 0) || 0
    }
  }).reverse()

  // 5. Chart Data: Inventory (Real)
  const { data: inventory } = await supabase
    .from("inventory_items")
    .select("name, current_stock, reorder_level")
    .order("current_stock", { ascending: true })
    .limit(8)

  const inventoryData = inventory?.map((i: any) => ({
    name: i.name,
    stock: Number(i.current_stock),
    reorder: Number(i.reorder_level)
  })) || []

  // 6. Chart Data: Order Distribution
  const { count: onlineOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).not("delivery_address", "ilike", "%Table%")
  const { count: onsiteOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).ilike("delivery_address", "%Table%")

  const orderTypeData = [
    { name: 'Online', value: onlineOrders || 0 },
    { name: 'On-site', value: onsiteOrders || 0 },
  ]

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    cookingOrders,
    revenueTrend: last7Days,
    inventoryData,
    orderTypeData
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  // Use Admin Client to ensure profile and stats are ALWAYS visible to the system
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== 'admin' && !profile.is_admin)) {
     redirect("/")
  }

  const stats = await getStats(adminSupabase)

  const { data: recentOrders } = await adminSupabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 space-y-10 font-sans antialiased flex-1">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground font-medium text-sm mt-2 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Live System Pulse — {format(new Date(), 'MMMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Button variant="outline" className="rounded-2xl border-2 font-bold px-6">Export Reports</Button>
           <Button asChild className="rounded-2xl font-black px-6 shadow-xl shadow-primary/20">
              <a href="/admin/settings/pos">Manage POS</a>
           </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Revenue" value={`Ksh ${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} trend="+14%" isUp={true} color="emerald" />
        <KPICard title="Total Orders" value={stats.totalOrders || 0} icon={<ShoppingCart className="h-5 w-5" />} trend="+28" isUp={true} color="blue" />
        <KPICard title="Customers" value={stats.totalUsers || 0} icon={<Users className="h-5 w-5" />} trend="+4%" isUp={true} color="violet" />
        <KPICard title="Critical Items" value={stats.inventoryData.filter((i: any) => i.stock < i.reorder).length} icon={<AlertTriangle className="h-5 w-5" />} trend="Requires Action" isUp={false} color="rose" />
      </div>

      {/* Analytics Visualization Zone */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-8">
            <LowStockAlerts />
            <DashboardCharts 
              revenueData={stats.revenueTrend}
              inventoryData={stats.inventoryData}
              orderTypeData={stats.orderTypeData}
            />
         </div>
         <div className="space-y-8">
            <Card className="p-8 border-none bg-card/50 backdrop-blur-xl shadow-2xl rounded-[32px]">
               <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center justify-between">
                  Operations Status
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
               </h2>
               <div className="space-y-8">
                  <StatusItem label="Kitchen Load" value={`${stats.cookingOrders} Active`} icon={<ChefHat className="h-5 w-5" />} color="orange" progress={75} />
                  <StatusItem label="Pending Setup" value={`${stats.pendingOrders} Orders`} icon={<Clock className="h-5 w-5" />} color="yellow" progress={30} />
                  <StatusItem label="Active Tables" value="8 / 12" icon={<Utensils className="h-5 w-5" />} color="green" progress={66} />
               </div>
               <Separator className="my-10 opacity-50" />
               <div>
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Quick Control</p>
                  <div className="grid grid-cols-2 gap-3">
                     <StockCountDialog>
                        <Button variant="outline" className="rounded-2xl h-12 font-bold uppercase text-[10px] bg-white hover:bg-gray-50 border-gray-200 shadow-sm">Stock Count</Button>
                     </StockCountDialog>
                     <ShiftReportDialog>
                        <Button variant="outline" className="rounded-2xl h-12 font-bold uppercase text-[10px] bg-white hover:bg-gray-50 border-gray-200 shadow-sm">Shift Report</Button>
                     </ShiftReportDialog>
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Recent Activity Table (Modernized) */}
      <Card className="p-8 border-none bg-card/50 backdrop-blur-xl shadow-2xl rounded-[32px]">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-2xl font-black uppercase tracking-tighter">Recent Transactions</h2>
               <p className="text-sm text-muted-foreground font-medium mt-1">Real-time sync from POS and Online channels</p>
            </div>
            <Button variant="ghost" asChild className="rounded-xl font-bold text-primary hover:text-primary hover:bg-primary/10">
              <a href="/admin/orders">View All Activity <ArrowUpRight className="ml-2 h-4 w-4" /></a>
            </Button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="text-left border-b border-border/50">
                     <th className="pb-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Order ID</th>
                     <th className="pb-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Customer</th>
                     <th className="pb-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Channel</th>
                     <th className="pb-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Amount</th>
                     <th className="pb-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                  {recentOrders?.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-muted/30 transition-colors">
                       <td className="py-5 font-bold text-sm">#{order.id.slice(0, 8)}</td>
                       <td className="py-5">
                          <p className="font-bold text-sm">{order.customer_name || 'Walk-in Customer'}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{order.customer_email || 'POS Terminal'}</p>
                       </td>
                       <td className="py-5">
                          <Badge variant="outline" className="rounded-lg text-[9px] uppercase font-black px-2 py-0.5 bg-white border-primary/20 text-primary shadow-sm">
                             {order.delivery_address?.includes('Table') ? 'POS' : 'Online'}
                          </Badge>
                       </td>
                       <td className="py-5 font-black text-sm text-foreground">Ksh {Number(order.total).toLocaleString()}</td>
                       <td className="py-5">
                          <div className="flex items-center gap-2">
                             <div className={`h-2 w-2 rounded-full ${order.status === 'complete' ? 'bg-green-500' : 'bg-orange-500'}`} />
                             <span className="text-[10px] font-black uppercase">{order.status}</span>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
      </main>
    </div>
  )
}

function KPICard({ title, value, icon, trend, isUp, color }: any) {
  return (
    <Card className="p-8 border-none bg-card shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[32px] group relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-${color}-500/10 group-hover:scale-150 transition-transform duration-700 blur-2xl`} />
      <div className="flex justify-between items-start mb-6">
         <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
            {icon}
         </div>
         <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
         </div>
      </div>
      <p className="text-xs font-black uppercase text-muted-foreground tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black tracking-tighter mt-2 text-foreground">{value}</h3>
    </Card>
  )
}

function StatusItem({ label, value, icon, color, progress }: any) {
  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
                {icon}
             </div>
             <span className="text-xs font-black text-foreground uppercase tracking-widest">{label}</span>
          </div>
          <span className="text-sm font-black text-foreground">{value}</span>
       </div>
       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
             className={`h-full bg-${color}-500 transition-all duration-1000`} 
             style={{ width: `${progress}%` }} 
          />
       </div>
    </div>
  )
}
