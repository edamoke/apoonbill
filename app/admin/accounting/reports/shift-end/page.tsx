"use client"

import { ReportView } from "@/components/admin/reports/report-view"

export default function EndShiftReportPage() {
  const columns = [
    { key: "staff", label: "Staff Member" },
    { key: "endTime", label: "End Time" },
    { key: "totalSales", label: "Total Sales", format: (val: any) => `KES ${val.toLocaleString()}` },
    { key: "closingStock", label: "Closing Stock Check" },
    { key: "handover", label: "Handover Status" }
  ]

  const data = [
    { staff: "John Gichuru", endTime: "16:00", totalSales: 15400, closingStock: "Verified", handover: "Complete" },
    { staff: "Mary Atieno", endTime: "16:30", totalSales: 0, closingStock: "Verified", handover: "Complete" }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ReportView 
        title="End Day Shift Report" 
        data={data} 
        columns={columns} 
      />
    </div>
  )
}
