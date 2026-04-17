"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getStaffPerformance } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Award } from "lucide-react"

export default function StaffReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getStaffPerformance()
        setData(result)
      } catch (error) {
        console.error("Failed to load staff performance data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const topWaiter = data.length > 0 ? data.reduce((prev, current) => (prev.totalSales > current.totalSales) ? prev : current) : null

  const columns = [
    { key: "name", label: "Waiter Name" },
    { key: "orderCount", label: "Orders Handled" },
    { key: "totalSales", label: "Total Revenue", format: (val: any) => `KES ${val.toLocaleString()}` },
    { key: "averageBill", label: "Avg Spend/Guest", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Staff Productivity & Sales Report</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Waiters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topWaiter?.name || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              KES {topWaiter?.totalSales?.toLocaleString() || 0} revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {data.length > 0 ? (data.reduce((sum, s) => sum + s.averageBill, 0) / data.length).toLocaleString() : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Staff Performance Breakdown" 
        data={data} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
