import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Mail, Phone, MapPin, Package, Clock } from "lucide-react"
import { OrderStatusTimeline } from "@/components/admin/order-status-timeline"
import { OrderStatusActions } from "@/components/admin/order-status-actions"
import { OrderTrackingCanvas } from "@/components/customer/order-tracking-canvas"

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const hasAdminAccess =
    profile?.is_admin || profile?.is_chef || profile?.is_rider || profile?.is_accountant || profile?.role === "admin"

  if (!hasAdminAccess) {
    console.warn(`[AdminOrderDetailPage] Unauthorized access attempt by ${user.email}`)
    redirect("/admin")
  }

  // Use admin client for resilient fetching
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (orderError || !order) {
    console.error(`[AdminOrderDetailPage] Order fetch failed for ID: ${id}`, orderError?.message)
    notFound()
  }

  // Fetch assigned staff separately if IDs are available
  let assignedChef = null
  let assignedRider = null
  let assignedAccountant = null

  if (order.assigned_chef_id) {
    const { data } = await adminSupabase.from("profiles").select("full_name").eq("id", order.assigned_chef_id).single()
    assignedChef = data
  }

  if (order.assigned_rider_id) {
    const { data } = await adminSupabase.from("profiles").select("full_name").eq("id", order.assigned_rider_id).single()
    assignedRider = data
  }

  if (order.assigned_accountant_id) {
    const { data } = await adminSupabase.from("profiles").select("full_name").eq("id", order.assigned_accountant_id).single()
    assignedAccountant = data
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracking Canvas */}
          <Card className="p-6">
            <h2 className="text-xl font-serif font-bold mb-6">Order Progress</h2>
            <OrderTrackingCanvas order={order} />
          </Card>

          {/* Order Status Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-serif font-bold mb-6">Order Status</h2>
            <OrderStatusTimeline order={order} />
          </Card>

          {/* Status Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-serif font-bold mb-6">Actions</h2>
            <OrderStatusActions
              order={order}
              isAdmin={profile?.is_admin}
              isChef={profile?.is_chef}
              isRider={profile?.is_rider}
              isAccountant={profile?.is_accountant}
            />
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-serif font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
                <p className="text-2xl font-bold text-primary">Ksh {Number(order.total).toFixed(2)}</p>
              </div>
              {order.chef_notes && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">Chef Notes</p>
                  <p className="text-sm">{order.chef_notes}</p>
                </div>
              )}
              {order.rider_notes && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Rider Notes</p>
                  <p className="text-sm">{order.rider_notes}</p>
                </div>
              )}
              {order.delivery_notes && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Delivery Notes</p>
                  <p className="text-sm">{order.delivery_notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <h3 className="font-serif font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{order.customer_name || "Guest"}</p>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${order.customer_email}`} className="text-primary hover:underline">
                    {order.customer_email}
                  </a>
                </div>
              )}
              {order.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">
                    {order.customer_phone}
                  </a>
                </div>
              )}
              {order.delivery_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{order.delivery_address}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Details */}
          <Card className="p-6">
            <h3 className="font-serif font-bold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Badge variant="secondary" className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Order Type</p>
                <p className="font-medium capitalize">{order.order_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Payment Status</p>
                <Badge variant="outline" className="capitalize">
                  {order.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Created</p>
                <p className="text-xs">
                  {new Date(order.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Assigned Staff */}
          <Card className="p-6">
            <h3 className="font-serif font-bold mb-4">Assigned Staff</h3>
            <div className="space-y-3 text-sm">
              {assignedAccountant && (
                <div>
                  <p className="text-muted-foreground mb-1">Accountant</p>
                  <p className="font-medium">{assignedAccountant.full_name}</p>
                </div>
              )}
              {assignedChef && (
                <div>
                  <p className="text-muted-foreground mb-1">Chef</p>
                  <p className="font-medium">{assignedChef.full_name}</p>
                </div>
              )}
              {assignedRider && (
                <div>
                  <p className="text-muted-foreground mb-1">Rider</p>
                  <p className="font-medium">{assignedRider.full_name}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Timing Info */}
          {(order.accountant_approved_at ||
            order.chef_started_at ||
            order.chef_completed_at ||
            order.rider_picked_at ||
            order.rider_delivered_at) && (
            <Card className="p-6">
              <h3 className="font-serif font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                {order.accountant_approved_at && (
                  <div>
                    <p className="text-muted-foreground mb-1">Approved</p>
                    <p className="text-xs">
                      {new Date(order.accountant_approved_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
                {order.chef_started_at && (
                  <div>
                    <p className="text-muted-foreground mb-1">Cooking Started</p>
                    <p className="text-xs">
                      {new Date(order.chef_started_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
                {order.chef_completed_at && (
                  <div>
                    <p className="text-muted-foreground mb-1">Cooking Completed</p>
                    <p className="text-xs">
                      {new Date(order.chef_completed_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
                {order.rider_picked_at && (
                  <div>
                    <p className="text-muted-foreground mb-1">Picked Up</p>
                    <p className="text-xs">
                      {new Date(order.rider_picked_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
                {order.rider_delivered_at && (
                  <div>
                    <p className="text-muted-foreground mb-1">Delivered</p>
                    <p className="text-xs">
                      {new Date(order.rider_delivered_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
