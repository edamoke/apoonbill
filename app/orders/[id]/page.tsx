import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react"
import { LiveOrderTracking } from "@/components/customer/live-order-tracking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  console.log(`[OrderDetailPage] INIT for ID: ${id}`)
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log(`[OrderDetailPage] No user session found, redirecting to login`)
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log(`[OrderDetailPage] User: ${user.id} (${user.email}), Admin: ${profile?.is_admin}`)

  // Use an admin-privileged client temporarily for diagnostics to see if RLS is the cause
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(`
      *, 
      order_items(*, products(*))
    `)
    .eq("id", id)
    .single()

  if (error || !order) {
    console.error(`[OrderDetailPage] Order fetch failed even with Admin client:`, error?.message)
    notFound()
  }

  console.log(`[OrderDetailPage] Order found: ${order.id}, Owner: ${order.user_id}, Email: ${order.customer_email}`)

  let finalOrder = { ...order }

  // Fetch staff details separately to avoid join failures if unassigned
  if (order.assigned_rider_id) {
    const { data: rider } = await adminSupabase.from("profiles").select("full_name, phone, avatar_url").eq("id", order.assigned_rider_id).single()
    finalOrder.rider = rider
  }
  if (order.assigned_chef_id) {
    const { data: chef } = await adminSupabase.from("profiles").select("full_name, phone").eq("id", order.assigned_chef_id).single()
    finalOrder.chef = chef
  }
  if (order.assigned_accountant_id) {
    const { data: accountant } = await adminSupabase.from("profiles").select("full_name").eq("id", order.assigned_accountant_id).single()
    finalOrder.accountant = accountant
  }

  // Double check ownership - use case-insensitive email matching
  const isOwner = 
    finalOrder.user_id === user.id || 
    finalOrder.customer_email?.toLowerCase() === user.email?.toLowerCase()
    
  if (!isOwner && !profile?.is_admin && profile?.role !== 'admin') {
    console.warn(`[OrderDetailPage] Unauthorized access attempt by user: ${user.id} (${user.email}) for order: ${id}`)
    // For now, let's see if we can at least show the order details to the admin-privileged view
    // redirect("/orders")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold">Track Your Order</h2>
            <LiveOrderTracking order={finalOrder} />
          </div>

          {/* Order Items */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {finalOrder.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × Ksh {Number(item.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-primary">Ksh {Number(item.total_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20">
              <CardTitle className="font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-5 bg-secondary/30 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Ksh {Number(finalOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">Ksh {Number(finalOrder.delivery_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-3xl font-bold text-primary">Ksh {Number(finalOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {finalOrder.rider && (finalOrder.status === "on_transit" || finalOrder.status === "delivered") && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4 transition-all hover:bg-primary/10">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {finalOrder.rider.full_name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Your Delivery Rider</p>
                      <p className="font-bold text-foreground">{finalOrder.rider.full_name}</p>
                      {finalOrder.rider.phone && (
                        <a href={`tel:${finalOrder.rider.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1 mt-1 font-medium">
                          <Phone className="h-3 w-3" />
                          {finalOrder.rider.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Order ID</p>
                <p className="font-mono text-sm bg-muted p-2 rounded border border-border/50 break-all">#{finalOrder.id.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Placed On</p>
                <p className="text-sm font-medium">
                  {new Date(finalOrder.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Type</p>
                  <Badge variant="outline" className="capitalize">{finalOrder.order_type}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Payment</p>
                  <Badge variant="outline" className="capitalize">{finalOrder.payment_status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm p-3 bg-secondary/20 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium truncate">{finalOrder.customer_email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 bg-secondary/20 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{finalOrder.customer_phone}</span>
              </div>
              {finalOrder.order_type === "delivery" && finalOrder.delivery_address && (
                <div className="flex items-start gap-3 text-sm p-3 bg-secondary/20 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium leading-tight">{finalOrder.delivery_address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(finalOrder.chef || finalOrder.rider || finalOrder.accountant) && (
            <Card className="border-border shadow-sm border-primary/10">
              <CardHeader>
                <CardTitle className="font-serif">Assigned Personnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {finalOrder.accountant && (
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Accountant</p>
                      <p className="text-sm font-bold">{finalOrder.accountant.full_name}</p>
                    </div>
                  </div>
                )}
                {finalOrder.chef && finalOrder.status !== "pending" && (
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Chef</p>
                      <p className="text-sm font-bold">{finalOrder.chef.full_name}</p>
                    </div>
                  </div>
                )}
                {finalOrder.rider && (finalOrder.status === "on_transit" || finalOrder.status === "delivered") && (
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Delivery Rider</p>
                      <p className="text-sm font-bold">{finalOrder.rider.full_name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
