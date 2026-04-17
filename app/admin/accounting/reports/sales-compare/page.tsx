"use client"

import { ReportView } from "@/components/admin/reports/report-view"

export default function SalesCompareReportPage() {
  const columns = [
    { key: "category", label: "Category" },
    { key: "visitSales", label: "Visit Sales", format: (val: any) => `KES ${val.toLocaleString()}` },
    { key: "onlineSales", label: "Online Sales", format: (val: any) => `KES ${val.toLocaleString()}` },
    { key: "total", label: "Total", format: (val: any) => `KES ${val.toLocaleString()}` },
    { key: "onlinePercentage", label: "Online %", format: (val: any) => `${val}%` }
  ]

  const data = [
    { category: "Main Course", visitSales: 25000, onlineSales: 15000, total: 40000, onlinePercentage: 37.5 },
    { category: "Drinks", visitSales: 12000, onlineSales: 3000, total: 15000, onlinePercentage: 20 }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ReportView 
        title="Online vs Visit Sales" 
        data={data} 
        columns={columns} 
      />
    </div>
  )
}
