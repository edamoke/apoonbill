import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bike, Package, CheckCircle } from "lucide-react"
import { DeliveryOrderCard } from "@/components/admin/delivery-order-card"

export default async function DeliveriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_rider) {
    redirect("/admin")
  }

  // Get orders ready for delivery
  const { data: readyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "ready")
    .order("created_at", { ascending: true })

  // Get orders currently being delivered by this rider
  const { data: deliveringOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "delivering")
    .eq("assigned_rider_id", user.id)
    .order("created_at", { ascending: true })

  // Get completed deliveries today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: completedToday } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "delivered")
    .eq("assigned_rider_id", user.id)
    .gte("delivery_completed_at", today.toISOString())

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Bike className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Deliveries</h1>
            <p className="text-muted-foreground">Manage your delivery orders</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ready for Pickup</p>
              <p className="text-3xl font-bold text-foreground mt-2">{readyOrders?.length || 0}</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Currently Delivering</p>
              <p className="text-3xl font-bold text-foreground mt-2">{deliveringOrders?.length || 0}</p>
            </div>
            <Bike className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
              <p className="text-3xl font-bold text-foreground mt-2">{completedToday?.length || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Delivery Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready for Pickup */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-serif font-bold">Ready for Pickup</h2>
            <Badge variant="secondary">{readyOrders?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {readyOrders && readyOrders.length > 0 ? (
              readyOrders.map((order) => <DeliveryOrderCard key={order.id} order={order} status="ready" />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders ready</p>
              </Card>
            )}
          </div>
        </div>

        {/* Currently Delivering */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-serif font-bold">Delivering</h2>
            <Badge variant="secondary">{deliveringOrders?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {deliveringOrders && deliveringOrders.length > 0 ? (
              deliveringOrders.map((order) => <DeliveryOrderCard key={order.id} order={order} status="delivering" />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <Bike className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active deliveries</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
