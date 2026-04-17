"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getStockStatus } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function StockReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getStockStatus()
        setData(result)
      } catch (error) {
        console.error("Failed to load stock data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const lowStockItems = data.filter(item => item.current_stock <= item.min_stock_level)
  const healthyItems = data.filter(item => item.current_stock > item.min_stock_level)

  const columns = [
    { key: "name", label: "Item Name" },
    { key: "current_stock", label: "Current Stock", format: (val: any) => `${val.toLocaleString()}` },
    { key: "unit", label: "Unit" },
    { key: "min_stock_level", label: "Min Level" },
    { key: "status", label: "Status" },
  ]

  // Add a status virtual field for the table
  const tableData = data.map(item => ({
    ...item,
    status: item.current_stock <= item.min_stock_level ? "LOW" : "OK"
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory & Stock Report</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Current Stock On Hand" 
        data={tableData} 
        columns={columns}
        isLoading={loading}
        onFiltersChange={() => {}} 
      />
    </div>
  )
}
