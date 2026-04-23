"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Gift, ArrowUpRight, Filter } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"

export default function CRMReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
      fetchCRMData()
    }
    init()
  }, [])

  async function fetchCRMData() {
    setLoading(true)
    const { data, error } = await supabase
      .from("customer_crm_analytics")
      .select("*")
      .order("lifetime_spend", { ascending: false })
    
    if (error) console.error(error)
    else setData(data || [])
    setLoading(false)
  }

  const columns = [
    { key: "full_name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "loyalty_points", label: "Points Bal" },
    { key: "total_orders", label: "Visits" },
    { key: "lifetime_spend", label: "LTV", format: (val: any) => `KES ${Number(val).toLocaleString()}` },
    { key: "last_visit", label: "Last Active", format: (val: any) => val ? new Date(val).toLocaleDateString() : 'N/A' },
  ]

  const topCustomers = data.slice(0, 5)
  const totalLiability = data.reduce((sum, c) => sum + (c.loyalty_points || 0), 0)

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">CRM & Loyalty Deep Analysis</h2>
            <p className="text-muted-foreground font-medium">Customer behavior and point liability tracking</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-lg bg-white rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{data.length}</div>
              <p className="text-[10px] text-green-600 font-bold mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Point Liability</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{totalLiability.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Outstanding points in system</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">LTV Average</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">
                KES {(data.reduce((sum, c) => sum + Number(c.lifetime_spend), 0) / (data.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Average lifetime value per guest</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gifts Earned</CardTitle>
              <Gift className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">
                {data.filter(c => c.loyalty_points >= 1000).length}
              </div>
              <p className="text-[10px] text-red-600 font-bold mt-1">Eligible for free food</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 border-none shadow-xl rounded-[32px] overflow-hidden">
            <CardHeader className="bg-slate-50 border-b p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest">Top Loyalty Performers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100">
                 {topCustomers.map((customer, i) => (
                   <div key={i} className="flex items-center p-6 hover:bg-slate-50 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary mr-4">
                       {i + 1}
                     </div>
                     <div className="flex-1">
                       <p className="font-bold text-slate-900">{customer.full_name || 'Anonymous'}</p>
                       <p className="text-xs text-muted-foreground">{customer.email}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-black text-primary">KES {Number(customer.lifetime_spend).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase">{customer.loyalty_points} Points</p>
                     </div>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-none shadow-xl rounded-[32px] bg-red-600 text-white relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 opacity-10">
                <Trophy className="w-64 h-64" />
             </div>
             <CardHeader className="p-8">
               <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Loyalty Engine Status</CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-6">
                <div>
                   <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Algorithm</p>
                   <p className="text-lg font-medium">1 Point per KES 100 spent</p>
                </div>
                <div>
                   <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Redemption Rules</p>
                   <ul className="text-sm space-y-2 list-disc list-inside font-medium">
                      <li>Free Drink: 500 Points</li>
                      <li>Free Starter: 800 Points</li>
                      <li>Free Main Course: 1500 Points</li>
                   </ul>
                </div>
                <Button className="w-full bg-white text-red-600 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs h-12 shadow-xl shadow-black/20">
                   Adjust Loyalty Settings
                </Button>
             </CardContent>
          </Card>
        </div>

        <ReportView 
          title="Global Customer CRM Registry" 
          data={data} 
          columns={columns}
          isLoading={loading}
          onFiltersChange={() => {}} 
        />
      </main>
    </div>
  )
}
