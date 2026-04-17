"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getPaymentMethodBreakdown } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Wallet, Smartphone, Banknote } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function PaymentsReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getPaymentMethodBreakdown()
        setData(result)
      } catch (error) {
        console.error("Failed to load payment data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const columns = [
    { key: "name", label: "Payment Method" },
    { key: "value", label: "Total Received", format: (val: any) => `KES ${val.toLocaleString()}` },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payment Method Breakdown</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `KES ${val.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {item.name === "cash" && <Banknote className="h-5 w-5 text-green-500" />}
                  {item.name === "mpesa" && <Smartphone className="h-5 w-5 text-blue-500" />}
                  {item.name === "card" && <CreditCard className="h-5 w-5 text-purple-500" />}
                  <span className="font-medium capitalize">{item.name}</span>
                </div>
                <div className="font-bold">KES {item.value.toLocaleString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Consolidated Payment Report" 
        data={data} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
