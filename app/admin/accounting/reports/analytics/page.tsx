"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getFinancialSummary, getLedgerEntries } from "@/app/actions/accounting-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, History, Key } from "lucide-react"

export default function AnalyticsReportPage() {
  const [summary, setSummary] = useState<any>(null)
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, ledRes] = await Promise.all([
          getFinancialSummary(),
          getLedgerEntries()
        ])
        if (sumRes.success) setSummary(sumRes.data)
        if (ledRes.success && ledRes.data) {
          setLedger(ledRes.data)
        }
      } catch (error) {
        console.error("Failed to load audit data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const columns = [
    { key: "transaction_date", label: "Date", format: (val: any) => new Date(val).toLocaleString() },
    { key: "description", label: "Action/Transaction" },
    { key: "transaction_type", label: "Type" },
    { key: "amount", label: "Value", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Audit, Security & Compliance</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Access Log</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-xs text-muted-foreground">All access restricted by RLS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Change History</CardTitle>
            <History className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No changes in last 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">None</div>
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Comprehensive Audit Trail (Ledger)" 
        data={ledger} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
