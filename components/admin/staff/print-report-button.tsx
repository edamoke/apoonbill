"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintReportButton() {
  return (
    <Button variant="outline" size="lg" className="gap-2" onClick={() => window.print()}>
      <Printer className="h-4 w-4" />
      Generate PDF Report
    </Button>
  )
}

export function PrintReportSimpleButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="mr-2 h-4 w-4" />
      Export Report
    </Button>
  )
}
