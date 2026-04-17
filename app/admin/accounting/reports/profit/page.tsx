"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getProfitabilityReport } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"

export default function ProfitReportPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getProfitabilityReport()
        setData(result)
      } catch (error) {
        console.error("Failed to load profit data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = [
    {
      title: "Total Revenue",
      value: `KES ${data?.revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      title: "Total Costs",
      value: `KES ${data?.cost?.toLocaleString() || 0}`,
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      title: "Gross Profit",
      value: `KES ${data?.grossProfit?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Profit Margin",
      value: `${data?.margin?.toFixed(2) || 0}%`,
      icon: Percent,
      color: "text-purple-500",
    },
  ]

  const tableData = data ? [
    { metric: "Total Revenue", amount: data.revenue },
    { metric: "Cost of Goods Sold (COGS)", amount: data.cost },
    { metric: "Gross Profit", amount: data.grossProfit },
  ] : []

  const columns = [
    { key: "metric", label: "Metric" },
    { key: "amount", label: "Amount", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Daily Profitability Report</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportView 
        title="Profitability Breakdown" 
        data={tableData} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
