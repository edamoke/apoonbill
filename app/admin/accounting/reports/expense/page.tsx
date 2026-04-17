"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getFinancialSummary, getLedgerEntries } from "@/app/actions/accounting-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, Calendar, FileText } from "lucide-react"

export default function ExpenseReportPage() {
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const ledRes = await getLedgerEntries()
        if (ledRes.success && ledRes.data) {
          setLedger(ledRes.data.filter((item: any) => item.transaction_type === 'expense'))
        }
      } catch (error) {
        console.error("Failed to load expense data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const totalExpense = ledger.reduce((sum, item) => sum + Number(item.amount), 0)

  const columns = [
    { key: "transaction_date", label: "Date", format: (val: any) => new Date(val).toLocaleDateString() },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Daily Expense Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (Period)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpense.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledger.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reporting Period</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Detailed Expense Log" 
        data={ledger} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
