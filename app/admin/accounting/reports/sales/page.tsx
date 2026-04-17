"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getSalesByItem, ReportFilters } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SalesReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({})

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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Daily Sales Performance</h2>
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
            <CardTitle>Sales Breakdown</CardTitle>
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
        title="Full Item Sales Report" 
        data={data} 
        columns={columns}
        isLoading={loading}
        onFiltersChange={setFilters}
      />
    </div>
  )
}
