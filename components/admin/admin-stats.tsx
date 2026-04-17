import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface AdminStatsProps {
  icon: LucideIcon
  label: string
  value: string | number
  valueClassName?: string
}

export function AdminStats({ icon: Icon, label, value, valueClassName }: AdminStatsProps) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-serif ${valueClassName || ""}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
