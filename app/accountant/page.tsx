import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { DollarSign, BarChart3, Clock, TrendingUp, Weight, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrderAcceptanceQueue } from "@/components/accountant/order-acceptance-queue"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"

export default async function AccountantDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAccountant = profile?.is_accountant || profile?.role === "accountant" || !!profile?.custom_role_id
  const isAdmin = profile?.is_admin || profile?.role === "admin"

  if (!isAccountant && !isAdmin) {
    console.log("[Accountant Dashboard] Access denied. Profile:", profile);
    // If user is just a customer, show customer dashboard, otherwise redirect to home
    if (profile?.role === 'customer' || !profile?.role) {
      redirect("/dashboard")
    }
    redirect("/")
  }

  // Calculate daily sales
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const { data: dailySales } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", today.toISOString())
    .in("payment_status", ["completed", "paid"]);

  const totalDaily = dailySales?.reduce((acc, curr) => acc + Number(curr.total || 0), 0) || 0;

  // Hourly weight/load (mocked or based on order volume if real weight is not in orders)
  const hourlyData = [
    { hour: '08:00', weight: 12 },
    { hour: '10:00', weight: 45 },
    { hour: '12:00', weight: 120 },
    { hour: '14:00', weight: 80 },
    { hour: '16:00', weight: 60 },
  ];

  // Fetch pending orders for acceptance
    const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*, profiles(full_name)")
    .eq("status", "pending")
    .is("accountant_approved_at", null)
    .order("created_at", { ascending: true })

  return (
    <div className="flex-1 flex flex-col">
      {/* 
        CRITICAL FIX: Removed SiteHeaderWrapper from accountant pages as it may contain 
        client-side redirect logic that triggers on certain roles. 
        Using a simplified header or no header if the sidebar is sufficient.
      */}
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground">Accountant Control Center</h1>
              <p className="text-muted-foreground">Financial reconciliation and order verification</p>
            </div>
          </div>
        </div>

        <OrderAcceptanceQueue initialOrders={pendingOrders as any || []} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Sales</p>
                <p className="text-2xl font-bold">Ksh {totalDaily.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50/10 rounded-full text-blue-500">
                <Weight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Load (Weight)</p>
                <p className="text-2xl font-bold">120 kg/hr</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50/10 rounded-full text-yellow-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Shifts</p>
                <p className="text-2xl font-bold">4 Staff</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50/10 rounded-full text-purple-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">24%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Hourly Weight of Day</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {hourlyData.map((d) => (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-md" 
                    style={{ height: `${(d.weight / 120) * 100}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{d.hour}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Supplier Delivery Performance</h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Total Deliveries</span>
                  <span className="font-bold">48</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-green-50/30 rounded-lg text-green-700">
                  <span className="font-medium">Successful</span>
                  <span className="font-bold">42</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-red-50/30 rounded-lg text-red-700">
                  <span className="font-medium">Failed</span>
                  <span className="font-bold">6</span>
               </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
