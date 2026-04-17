"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getFinancialSummary, getLedgerEntries } from "@/app/actions/accounting-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, TrendingDown, DollarSign, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountantPNLReportPage() {
  const [ledger, setLedger] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
      try {
        const [sumRes, ledRes] = await Promise.all([
          getFinancialSummary(),
          getLedgerEntries()
        ])
        if (sumRes.success) setSummary(sumRes.data)
        if (ledRes.success && ledRes.data) setLedger(ledRes.data)
      } catch (error) {
        console.error("Failed to load P&L data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const columns = [
    { key: "transaction_date", label: "Date", format: (val: any) => new Date(val).toLocaleDateString() },
    { key: "description", label: "Account/Description" },
    { key: "transaction_type", label: "Category" },
    { key: "amount", label: "Amount", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - P&L Report</span>
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
          <h2 className="text-3xl font-bold tracking-tight">Profit & Loss Statement</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {summary?.totalIncome?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {summary?.totalExpense?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {summary?.netProfit?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalIncome > 0 
                  ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) 
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <ReportView 
          title="Consolidated P&L Ledger" 
          data={ledger} 
          columns={columns}
          isLoading={loading}
        />
      </main>
    </div>
  )
}
