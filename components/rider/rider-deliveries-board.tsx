"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { pickupOrder, deliverOrder } from "@/app/actions/rider-actions"
import { useRouter } from "next/navigation"
import { MapPin, Phone, CheckCircle, Bike, Package, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  delivery_address: string
  status: string
  total: number
  created_at: string
  assigned_rider_id: string | null
  order_items: Array<{
    item_name: string
    quantity: number
  }>
}

interface RiderDeliveriesBoardProps {
  userId: string
  assignedOrders: Order[]
  availableOrders: Order[]
}

export function RiderDeliveriesBoard({ userId, assignedOrders, availableOrders }: RiderDeliveriesBoardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('rider_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const handlePickup = async (orderId: string) => {
    setLoading(orderId)
    const result = await pickupOrder(orderId)

    if (result.success) {
      toast({
        title: "Order Picked Up",
        description: "Status updated to out for delivery",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to pickup order",
        variant: "destructive"
      })
    }

    setLoading(null)
  }

  const handleDeliver = async (orderId: string) => {
    setLoading(orderId)
    const result = await deliverOrder(orderId)

    if (result.success) {
      toast({
        title: "Order Delivered",
        description: "Delivery completed successfully",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to deliver order",
        variant: "destructive"
      })
    }

    setLoading(null)
  }

  const DeliveryCard = ({ 
    order, 
    type 
  }: { 
    order: Order; 
    type: "available" | "assigned" | "active" 
  }) => (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-serif">#{order.id.slice(0, 8).toUpperCase()}</CardTitle>
          <Badge variant={
            order.status === "out_for_delivery" ? "default" : 
            order.status === "ready" ? "secondary" : "outline"
          }>
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{order.customer_name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Phone className="h-3 w-3" />
            {order.customer_phone}
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span>{order.delivery_address}</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Order Items:</p>
          {order.order_items.map((item, idx) => (
            <div key={idx} className="text-sm">
              {item.quantity}x {item.item_name}
            </div>
          ))}
        </div>


        {type === "available" && (
          <Button size="sm" className="w-full" onClick={() => handlePickup(order.id)} disabled={loading === order.id}>
            <Bike className="mr-2 h-4 w-4" />
            Accept & Pickup
          </Button>
        )}

        {type === "assigned" && (
          <Button size="sm" className="w-full" onClick={() => handlePickup(order.id)} disabled={loading === order.id}>
            <Package className="mr-2 h-4 w-4" />
            Start Delivery
          </Button>
        )}

        {type === "active" && (
          <Button size="sm" className="w-full" onClick={() => handleDeliver(order.id)} disabled={loading === order.id}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        )}
      </CardContent>
    </Card>
  )

  const activeDeliveries = assignedOrders.filter((o) => o.status === "out_for_delivery")
  const readyAssignedDeliveries = assignedOrders.filter((o) => o.status === "ready")
  const completedDeliveries = assignedOrders.filter((o) => o.status === "delivered")

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Column 1: Available & Assigned Ready */}
      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-serif mb-1">Available for Pickup</h2>
            <p className="text-sm text-muted-foreground">{availableOrders.length} orders</p>
          </div>
          <div className="space-y-4">
            {availableOrders.length > 0 ? (
              availableOrders.map((order) => <DeliveryCard key={order.id} order={order} type="available" />)
            ) : (
              <Card className="border-border border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                  No available deliveries
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {readyAssignedDeliveries.length > 0 && (
          <div className="animate-pulse">
            <div className="mb-4">
              <h2 className="text-xl font-serif mb-1 text-[#2d5a4a] flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2d5a4a]" />
                Your Orders (Ready)
              </h2>
              <p className="text-sm text-muted-foreground">{readyAssignedDeliveries.length} orders waiting for you</p>
            </div>
            <div className="space-y-4">
              {readyAssignedDeliveries.map((order) => (
                <DeliveryCard key={order.id} order={order} type="assigned" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Column 2: Active Deliveries */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-serif mb-1">Active Deliveries</h2>
          <p className="text-sm text-muted-foreground">{activeDeliveries.length} orders</p>
        </div>
        <div className="space-y-4">
          {activeDeliveries.length > 0 ? (
            activeDeliveries.map((order) => <DeliveryCard key={order.id} order={order} type="active" />)
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">No active deliveries</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Column 3: Completed Today */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-serif mb-1">Completed Today</h2>
          <p className="text-sm text-muted-foreground">{completedDeliveries.length} orders</p>
        </div>
        <div className="space-y-4">
          {completedDeliveries.length > 0 ? (
            completedDeliveries.slice(0, 10).map((order) => (
              <Card key={order.id} className="border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">
                No completed deliveries
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
