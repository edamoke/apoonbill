"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { OrderTrackingCanvas } from "./order-tracking-canvas"
import { CheckCircle2, Clock, ChefHat, Truck, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveOrderTrackingProps {
  order: any
}

export function LiveOrderTracking({ order: initialOrder }: LiveOrderTrackingProps) {
  const [order, setOrder] = useState(initialOrder)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order-${initialOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${initialOrder.id}`,
        },
        (payload) => {
          console.log("[v0] Order updated:", payload.new)
          setOrder(payload.new)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [initialOrder.id])

  const stages = [
    {
      key: "pending",
      label: "Order Received",
      icon: Package,
      description: order.id ? `Order #${order.id.slice(0, 8)} Verified` : "Waiting for verification",
      active: true,
      completed: !!order.accountant_approved_at || ["approved", "confirmed", "cooking", "ready", "on_transit", "delivered", "served"].includes(order.status),
    },
    {
      key: "approved",
      label: "Order Confirmed",
      icon: CheckCircle2,
      description: "Order is being processed",
      active: !!order.accountant_approved_at || ["approved", "confirmed", "cooking", "ready", "on_transit", "delivered", "served"].includes(order.status),
      completed: !!order.chef_started_at || ["cooking", "ready", "on_transit", "delivered", "served"].includes(order.status),
    },
    {
      key: "preparing",
      label: "Being Prepared",
      icon: ChefHat,
      description: order.assigned_chef_id ? "Chef is cooking your order" : "Chef will start soon",
      active: !!order.chef_started_at || ["cooking", "ready", "on_transit", "delivered", "served"].includes(order.status),
      completed: !!order.chef_completed_at || ["ready", "on_transit", "delivered", "served"].includes(order.status),
    },
    {
      key: "ready",
      label: "Ready for Pickup",
      icon: CheckCircle2,
      description: order.delivery_type === 'dine_in' ? "Ready to be served" : "Waiting for rider",
      active: !!order.chef_completed_at || ["ready", "on_transit", "delivered", "served"].includes(order.status),
      completed: !!(order.delivery_started_at || order.rider_picked_at) || ["on_transit", "delivered", "served"].includes(order.status),
    },
    {
      key: "delivering",
      label: order.delivery_type === 'dine_in' ? "Being Served" : "In Transit",
      icon: Truck,
      description: order.delivery_type === 'dine_in' ? "Waiter is bringing your food" : "Rider has started the trip",
      active: !!(order.delivery_started_at || order.rider_picked_at) || ["on_transit", "out_for_delivery", "delivered", "served"].includes(order.status),
      completed: !!order.rider_delivered_at || ["delivered", "served"].includes(order.status),
    },
    {
      key: "delivered",
      label: order.delivery_type === 'dine_in' ? "Served" : "Delivered",
      icon: CheckCircle2,
      description: order.delivery_type === 'dine_in' ? "Enjoy your meal!" : "Order completed successfully",
      active: !!order.rider_delivered_at || ["delivered", "served"].includes(order.status),
      completed: !!order.rider_delivered_at || ["delivered", "served"].includes(order.status),
    },
  ]

  const currentStage = stages.findIndex((s) => s.active && !s.completed)
  const displayStage = currentStage >= 0 ? currentStage : stages.length - 1

  return (
    <div className="space-y-6">
      <OrderTrackingCanvas order={order} />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Current Status</h3>
          <p className="text-sm text-muted-foreground">Your order is being processed</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {stages[displayStage].label}
        </Badge>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isActive = index === displayStage
          const isCompleted = stage.completed
          const isPending = !stage.active

          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "rounded-full p-3 border-2 transition-all",
                    isCompleted && "bg-green-500 border-green-500",
                    isActive && "bg-primary border-primary animate-pulse",
                    isPending && "bg-muted border-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isCompleted && "text-white",
                      isActive && "text-white",
                      isPending && "text-muted-foreground",
                    )}
                  />
                </div>
                {index < stages.length - 1 && (
                  <div className={cn("w-0.5 h-12 mt-2", isCompleted ? "bg-green-500" : "bg-muted")} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <p className={cn("font-medium", isCompleted && "text-green-600", isActive && "text-primary")}>
                  {stage.label}
                </p>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                {stage.completed && (stage.completed !== true) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {typeof stage.completed === 'string' ? new Date(stage.completed).toLocaleTimeString() : "Updated"}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
