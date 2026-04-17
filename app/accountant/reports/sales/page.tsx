"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getSalesByItem, ReportFilters } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountantSalesReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({})
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/sign-in");
        return;
      }
      setUser(user);
      
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profile);

      const isAccountant = profile?.is_accountant || profile?.role === "accountant" || !!profile?.custom_role_id;
      const isAdmin = profile?.is_admin || profile?.role === "admin";

      if (!isAccountant && !isAdmin) {
        router.push("/dashboard");
        return;
      }
    }
    checkAccess();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const result = await getSalesByItem(filters)
        setData(result)
      } catch (error) {
        console.error("Failed to load sales data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters])

  const columns = [
    { key: "name", label: "Item Name" },
    { key: "quantity", label: "Qty Sold" },
    { key: "revenue", label: "Total Revenue", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  const chartData = data.slice(0, 10)

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - Sales Report</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user?.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Sales Performance Report</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Top 10 Selling Items (Revenue)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `KES ${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`KES ${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Sales Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {data.slice(0, 5).map((item, i) => (
                   <div key={i} className="flex items-center">
                     <div className="ml-4 space-y-1 flex-1">
                       <p className="text-sm font-medium leading-none">{item.name}</p>
                       <p className="text-sm text-muted-foreground">
                         {item.quantity} units sold
                       </p>
                     </div>
                     <div className="ml-auto font-medium">
                       +KES {item.revenue.toLocaleString()}
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

        <ReportView 
          title="Consolidated Item Sales" 
          data={data} 
          columns={columns}
          isLoading={loading}
          onFiltersChange={setFilters}
        />
      </main>
    </div>
  )
}
