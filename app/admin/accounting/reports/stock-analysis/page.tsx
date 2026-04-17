"use client"

import { useState, useEffect } from "react"
import { ReportView } from "@/components/admin/reports/report-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  captureStockSnapshot, 
  getStockVarianceReport, 
  getAvailableSnapshotDates 
} from "@/app/actions/stock-actions"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, Play, CheckCircle2, TrendingDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function StockAnalysisPage() {
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDates()
  }, [])

  async function loadDates() {
    const availableDates = await getAvailableSnapshotDates()
    setDates(availableDates)
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }

  useEffect(() => {
    if (selectedDate) {
      loadReport()
    }
  }, [selectedDate])

  async function loadReport() {
    setLoading(true)
    try {
      const result = await getStockVarianceReport(selectedDate)
      setData(result)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load variance report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleCapture(type: 'day_start' | 'day_end') {
    setLoading(true)
    try {
      await captureStockSnapshot(type)
      toast({ title: "Success", description: `${type} snapshot captured successfully` })
      loadDates()
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to capture snapshot.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: "item_name", label: "Item Name" },
    { key: "start_qty", label: "Day Start", format: (val: any) => `${val} ${data[0]?.unit || ''}` },
    { key: "end_qty", label: "Day End", format: (val: any) => val ? `${val} ${data[0]?.unit || ''}` : 'N/A' },
    { key: "recorded_usage", label: "System Sales Usage" },
    { key: "actual_usage", label: "Physical Usage" },
    { 
      key: "variance_qty", 
      label: "Variance (Qty)", 
      format: (val: any) => (
        <span className={Number(val) < 0 ? "text-red-500 font-bold" : "text-green-500"}>
          {Number(val).toFixed(2)}
        </span>
      )
    },
    {
      key: "cost_variance_impact",
      label: "Financial Impact",
      format: (val: any) => (
        <span className={Number(val) < 0 ? "text-red-500 font-medium" : "text-green-500"}>
          KES {Math.abs(Number(val)).toLocaleString()}
        </span>
      )
    }
  ]

  const totalLoss = data.reduce((sum, item) => sum + (Number(item.cost_variance_impact) < 0 ? Math.abs(Number(item.cost_variance_impact)) : 0), 0)
  const discrepancies = data.filter(item => Math.abs(item.variance_qty) > 0.01)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Stock Reconciliation (Day Start / End)</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleCapture('day_start')} variant="outline" className="bg-green-50 border-green-200 text-green-700">
            <Play className="mr-2 h-4 w-4" />
            Capture Day Start
          </Button>
          <Button onClick={() => handleCapture('day_end')} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Capture Day End
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reconciliation Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {dates.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{discrepancies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue Loss</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">KES {totalLoss.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {discrepancies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Manager's Audit Required</AlertTitle>
          <AlertDescription>
            Automated analysis has detected {discrepancies.length} items with significant usage variance. 
            The total estimated cost impact for {selectedDate} is <b>KES {totalLoss.toLocaleString()}</b>. 
            Please review the items marked in red below.
          </AlertDescription>
        </Alert>
      )}

      <ReportView 
        title={`Automated Stock Variance Report: ${selectedDate}`}
        data={data}
        columns={columns as any}
        isLoading={loading}
      />
    </div>
  )
}
