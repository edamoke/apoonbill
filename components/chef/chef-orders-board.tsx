"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { startCooking, markOrderReady } from "@/app/actions/chef-actions"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, ChefHat } from "lucide-react"

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  order_type: string
  status: string
  total: number
  special_instructions: string | null
  created_at: string
  order_items: Array<{
    item_name: string
    quantity: number
    special_requests: string | null
  }>
}

export function ChefOrdersBoard({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStartCooking = async (orderId: string) => {
    setLoading(orderId)
    const result = await startCooking(orderId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to start cooking")
    }

    setLoading(null)
  }

  const handleMarkReady = async (orderId: string) => {
    setLoading(orderId)
    const result = await markOrderReady(orderId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Failed to mark order ready")
    }

    setLoading(null)
  }

  const approvedOrders = orders.filter((o) => o.status === "approved" || o.status === "received" || o.status === "pending")
  const cookingOrders = orders.filter((o) => o.status === "cooking" || o.status === "processing" || o.status === "preparing")
  const readyOrders = orders.filter((o) => o.status === "ready" || o.status === "complete" || o.status === "delivered")

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-serif">#{order.id.slice(0, 8).toUpperCase()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{order.customer_name}</p>
          </div>
          <Badge variant={order.order_type === "delivery" ? "default" : "outline"}>{order.order_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.order_items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.item_name}
              </span>
              {item.special_requests && <span className="text-destructive text-xs">*Special</span>}
            </div>
          ))}
        </div>

        {order.special_instructions && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
            <p className="text-xs text-destructive font-medium mb-1">Special Instructions:</p>
            <p className="text-xs text-muted-foreground">{order.special_instructions}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        <div className="flex gap-2">
          {(order.status === "approved" || order.status === "received") && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleStartCooking(order.id)}
              disabled={loading === order.id}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Start Cooking
            </Button>
          )}
          {(order.status === "cooking" || order.status === "processing") && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleMarkReady(order.id)}
              disabled={loading === order.id}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Approved Orders */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-serif mb-1">Approved Orders</h2>
          <p className="text-sm text-muted-foreground">{approvedOrders.length} orders</p>
        </div>
        <div className="space-y-4">
          {approvedOrders.length > 0 ? (
            approvedOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">No approved orders</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cooking */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-serif mb-1">Cooking</h2>
          <p className="text-sm text-muted-foreground">{cookingOrders.length} orders</p>
        </div>
        <div className="space-y-4">
          {cookingOrders.length > 0 ? (
            cookingOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">No orders cooking</CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Ready for Pickup */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-serif mb-1">Ready for Pickup</h2>
          <p className="text-sm text-muted-foreground">{readyOrders.length} orders</p>
        </div>
        <div className="space-y-4">
          {readyOrders.length > 0 ? (
            readyOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground text-sm">No orders ready</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
