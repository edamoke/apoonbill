"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getSupplierBalances } from "@/app/actions/report-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Users, Truck } from "lucide-react"

export default function PurchasingReportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getSupplierBalances()
        setData(result)
      } catch (error) {
        console.error("Failed to load purchasing data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const columns = [
    { key: "name", label: "Supplier Name" },
    { key: "contact_person", label: "Contact Person" },
    { 
      key: "itemCount", 
      label: "Items Supplied", 
      format: (val: any) => `${val || 0}` 
    },
  ]

  const tableData = data.map(supplier => ({
    ...supplier,
    itemCount: supplier.inventory_items?.length || 0
  }))

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Purchasing & Supplier Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming from PO system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases (MTD)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES --</div>
          </CardContent>
        </Card>
      </div>

      <ReportView 
        title="Supplier Directory & Inventory Summary" 
        data={tableData} 
        columns={columns}
        isLoading={loading}
      />
    </div>
  )
}
