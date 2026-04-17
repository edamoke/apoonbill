"use client"

import { ReportView } from "@/components/admin/reports/report-view"

export default function NewShiftReportPage() {
  const columns = [
    { key: "staff", label: "Staff Member" },
    { key: "role", label: "Role" },
    { key: "startTime", label: "Start Time" },
    { key: "initialStock", label: "Initial Stock Check" },
    { key: "notes", label: "Notes" }
  ]

  const data = [
    { staff: "John Gichuru", role: "Captain", startTime: "08:00", initialStock: "Verified", notes: "All stations ready" },
    { staff: "Mary Atieno", role: "Chef", startTime: "07:30", initialStock: "Verified", notes: "Kitchen prepped" }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ReportView 
        title="New Day Shift Report" 
        data={data} 
        columns={columns} 
      />
    </div>
  )
}
