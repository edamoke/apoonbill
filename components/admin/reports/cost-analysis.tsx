"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CostAnalysisProps {
  data: {
    revenue: number
    cost: number
    foodCostPercent: number
    margin: number
  }
}

export function CostAnalysis({ data }: CostAnalysisProps) {
  const chartData = [
    { name: "Cost of Sales", value: data.cost, color: "hsl(var(--destructive))" },
    { name: "Gross Profit", value: data.revenue - data.cost, color: "hsl(var(--primary))" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `KES ${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Critical Cost Ratios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Food Cost %</span>
              <span className="font-bold">{data.foodCostPercent.toFixed(1)}%</span>
            </div>
            <Progress value={data.foodCostPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: 25-35% for profitable operations</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Gross Margin</span>
              <span className="font-bold">{data.margin.toFixed(1)}%</span>
            </div>
            <Progress value={data.margin} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground">
              Target: {">"} 65% for high-end restaurants
            </p>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Inventory Efficiency</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{(data.revenue / (data.cost || 1)).toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Revenue per Cost Unit</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">KES {(data.revenue - data.cost).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Contribution Margin</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
