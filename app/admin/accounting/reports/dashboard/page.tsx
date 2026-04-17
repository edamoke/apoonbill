"use client"

import { useEffect, useState } from "react"
import { 
  getDailySalesSummary, 
  getProfitabilityReport, 
  getAdvancedFinancials, 
  getWastageReport,
  getSalesByTime
} from "@/app/actions/report-actions"
import { hasPermission } from "@/app/actions/rbac-check"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfitLossMetrics } from "@/components/admin/reports/profit-loss-metrics"
import { CostAnalysis } from "@/components/admin/reports/cost-analysis"
import { IoTMonitor } from "@/components/admin/reports/iot-monitor-hub"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertCircle, ArrowUpRight, Utensils } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"

export default function AdminExecutiveDashboard() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [salesSummary, setSalesSummary] = useState<any>(null)
  const [profitability, setProfitability] = useState<any>(null)
  const [financials, setFinancials] = useState<any>(null)
  const [wastage, setWastage] = useState<any>(null)
  const [hourlySales, setHourlySales] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          redirect("/admin/sign-in")
          return
        }

        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(prof)

        const canView = await hasPermission('accounting', 'view')

        if (!canView) {
          redirect("/dashboard")
          return
        }

        const [sales, profit, fin, waste, hourly] = await Promise.all([
          getDailySalesSummary().catch(e => {
            console.error("Error in getDailySalesSummary", e);
            return { totalSales: 0, grossSales: 0, netSales: 0, paymentSplit: {}, outletSplit: {} };
          }),
          getProfitabilityReport().catch(e => {
            console.error("Error in getProfitabilityReport", e);
            return { revenue: 0, cost: 0, grossProfit: 0, margin: 0, foodCostPercent: 0 };
          }),
          getAdvancedFinancials().catch(e => {
            console.error("Error in getAdvancedFinancials", e);
            return { monthlyTrends: [], bestMonth: null, worstMonth: null, predictedProfitNextMonth: 0 };
          }),
          getWastageReport().catch(e => {
            console.error("Error in getWastageReport", e);
            return { totalLoss: 0, byReason: {} };
          }),
          getSalesByTime().catch(e => {
            console.error("Error in getSalesByTime", e);
            return { hourlySales: [], peakRevenue: 0, offPeakRevenue: 0 };
          })
        ])
        setSalesSummary(sales)
        setProfitability(profit)
        setFinancials(fin)
        setWastage(waste)
        setHourlySales(hourly)
      } catch (error) {
        console.error("Dashboard data load failed", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Executive Insights...</div>

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
      </div>

      {!salesSummary && !profitability && !financials && !wastage && !hourlySales ? (
         <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Executive Data Available</h3>
            <p className="text-muted-foreground">We couldn't load the dashboard analytics. Check if there are completed orders in the system.</p>
         </div>
      ) : (
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="bar-iot">Bar & Drinks IoT</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Level 1: Profit & Prediction Metrics */}
          <ProfitLossMetrics data={financials} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Level 2: Sales Trends & Daily Summary */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hourly Sales Performance (Peak vs Off-Peak)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlySales?.hourlySales || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" fontSize={12} tickFormatter={(val) => val != null ? `${val}:00` : ""} />
                  <YAxis fontSize={12} tickFormatter={(val) => `KES ${val}`} />
                  <Tooltip formatter={(val: any) => [`KES ${Number(val).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
               <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-primary" />
                 <span className="text-sm font-medium">Peak Revenue: KES {hourlySales?.peakRevenue?.toLocaleString() || '0'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-full bg-muted" />
                 <span className="text-sm font-medium">Off-Peak: KES {hourlySales?.offPeakRevenue?.toLocaleString() || '0'}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Daily Sales Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales (Gross)</p>
                <h3 className="text-2xl font-bold">KES {Number(salesSummary?.totalSales || 0).toLocaleString()}</h3>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Payment Split</p>
              {salesSummary?.paymentSplit && Object.entries(salesSummary.paymentSplit).map(([method, amount]: [string, any]) => (
                <div key={method} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{method}</span>
                  <span className="font-semibold">KES {Number(amount).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Outlet Performance</p>
              {salesSummary?.outletSplit && Object.entries(salesSummary.outletSplit).map(([outlet, amount]: [string, any]) => (
                <div key={outlet} className="flex items-center justify-between text-sm">
                  <span>{outlet}</span>
                  <span className="font-semibold">KES {Number(amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level 3: Cost & Efficiency */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <CostAnalysis data={profitability} />
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Wastage & Loss Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
               <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                 <AlertCircle className="h-4 w-4" />
                 <span className="text-sm font-semibold">Total Wastage Loss</span>
               </div>
               <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                 KES {Number(wastage?.totalLoss || 0).toLocaleString()}
               </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Loss by Reason</p>
              {wastage?.byReason && Object.entries(wastage.byReason).map(([reason, count]: [string, any]) => (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">{reason}</span>
                    <span>{count} incidents</span>
                  </div>
                  <Progress value={(count / (Object.values(wastage.byReason).reduce((a:any, b:any) => a+b, 0) as number || 1)) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="bar-iot">
          <IoTMonitor />
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
