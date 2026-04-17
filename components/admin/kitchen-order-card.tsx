"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface KitchenOrderCardProps {
  order: any
  status: "pending" | "cooking" | "ready"
}

export function KitchenOrderCard({ order, status }: KitchenOrderCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const startCooking = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("orders")
      .update({
        status: "cooking",
        cooking_started_at: new Date().toISOString(),
      })
      .eq("id", order.id)
    router.refresh()
    setLoading(false)
  }

  const markReady = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from("orders")
      .update({
        status: "ready",
        cooking_completed_at: new Date().toISOString(),
      })
      .eq("id", order.id)
    router.refresh()
    setLoading(false)
  }

  const timeAgo = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{order.profiles?.full_name || "Guest"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {timeAgo(status === "cooking" ? order.cooking_started_at : order.created_at)}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">Order Total: Ksh {Number(order.total).toFixed(2)}</p>
        {order.chef_notes && (
          <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">Note: {order.chef_notes}</p>
        )}
      </div>

      <div className="pt-2">
        {status === "pending" && (
          <Button onClick={startCooking} disabled={loading} className="w-full" size="sm">
            Start Cooking
          </Button>
        )}
        {status === "cooking" && (
          <Button onClick={markReady} disabled={loading} className="w-full" size="sm" variant="default">
            Mark as Ready
          </Button>
        )}
        {status === "ready" && (
          <Badge variant="outline" className="w-full justify-center py-2 border-green-500 text-green-500">
            Ready for Pickup
          </Badge>
        )}
      </div>
    </Card>
  )
}
