import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { KitchenOrderCard } from "@/components/admin/kitchen-order-card"

export default async function KitchenPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_chef) {
    redirect("/admin")
  }

  // Get orders that need cooking
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["pending", "confirmed"])
    .order("created_at", { ascending: true })

  const { data: cookingOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "cooking")
    .order("created_at", { ascending: true })

  const { data: readyOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "ready")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Kitchen</h1>
            <p className="text-muted-foreground">Manage orders and cooking status</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
              <p className="text-3xl font-bold text-foreground mt-2">{pendingOrders?.length || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cooking Now</p>
              <p className="text-3xl font-bold text-foreground mt-2">{cookingOrders?.length || 0}</p>
            </div>
            <ChefHat className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ready for Pickup</p>
              <p className="text-3xl font-bold text-foreground mt-2">{readyOrders?.length || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-serif font-bold">Pending</h2>
            <Badge variant="secondary">{pendingOrders?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {pendingOrders && pendingOrders.length > 0 ? (
              pendingOrders.map((order) => <KitchenOrderCard key={order.id} order={order} status="pending" />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending orders</p>
              </Card>
            )}
          </div>
        </div>

        {/* Cooking Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-serif font-bold">Cooking</h2>
            <Badge variant="secondary">{cookingOrders?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {cookingOrders && cookingOrders.length > 0 ? (
              cookingOrders.map((order) => <KitchenOrderCard key={order.id} order={order} status="cooking" />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders cooking</p>
              </Card>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-serif font-bold">Ready</h2>
            <Badge variant="secondary">{readyOrders?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {readyOrders && readyOrders.length > 0 ? (
              readyOrders.map((order) => <KitchenOrderCard key={order.id} order={order} status="ready" />)
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No orders ready</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
