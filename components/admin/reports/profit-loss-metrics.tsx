"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react"

interface ProfitLossMetricsProps {
  data: {
    bestMonth: { month: string; profit: number } | null
    worstMonth: { month: string; profit: number } | null
    predictedProfitNextMonth: number
  }
}

export function ProfitLossMetrics({ data }: ProfitLossMetricsProps) {
  const formatMonth = (monthStr: string | undefined) => {
    if (!monthStr) return "N/A"
    const [year, month] = monthStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Month Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {data.bestMonth?.profit.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">{formatMonth(data.bestMonth?.month)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worst Month Profit</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {data.worstMonth?.profit.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">{formatMonth(data.worstMonth?.month)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Predicted Profit (Next Month)</CardTitle>
          <Target className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">KES {data.predictedProfitNextMonth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Based on 3-month average</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analysis Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Last 6 Months</div>
          <p className="text-xs text-muted-foreground">Rolling window</p>
        </CardContent>
      </Card>
    </div>
  )
}
