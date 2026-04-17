import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, ShoppingBag, Calendar } from "lucide-react"
import Link from "next/link"
import { LoyaltyCard } from "@/components/customer/loyalty-card"
import { SocialMediaLoyalty } from "@/components/customer/social-media-loyalty"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate total spent
  const totalSpent = orders?.reduce((acc, order) => {
    if (order.status !== "cancelled" && order.payment_status === "completed") {
      return acc + Number(order.total || 0)
    }
    return acc
  }, 0) || 0

  // Get recent venue bookings
  const { data: bookings } = await supabase
    .from("venue_bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const recentOrders = orders?.slice(0, 5) || []

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || "User"}!</h1>
          <p className="text-muted-foreground font-medium">Here's an overview of your activity and spending.</p>
        </div>
        <div className="w-full md:w-[400px]">
           <LoyaltyCard profile={profile} />
        </div>
      </div>

      {/* Account Summary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">Ksh {totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Across all completed orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders Placed</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Total order history</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              {bookings?.filter(b => b.status === "confirmed" || b.status === "pending").length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Confirmed & pending</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">
              Ksh {orders?.length ? (totalSpent / orders.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Per completed order</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-border/50 shadow-md rounded-[24px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="font-serif">Recent Orders</CardTitle>
              <CardDescription>Your latest meal orders</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-primary">{order.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">Ksh {Number(order.total).toLocaleString()}</p>
                      <Button asChild variant="link" size="sm" className="h-auto p-0 font-bold text-xs">
                        <Link href={`/orders/${order.id}`}>Track Journey</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4 font-serif italic text-lg text-slate-400">"The secret ingredient is always hunger."</p>
                <Button asChild className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-xs">
                  <Link href="/menu">Browse Our Menu</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Social Media Points */}
      <div className="lg:col-span-2">
        <SocialMediaLoyalty user={user} />
      </div>

      {/* Recent Venue Bookings */}
      <Card className="border-border/50 shadow-md rounded-[24px] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="font-serif">Venue Bookings</CardTitle>
              <CardDescription>Your reservation requests</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/offers-events">New Booking</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold text-sm capitalize">{booking.venue_name.replace("_", " ")}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {new Date(booking.booking_date).toLocaleDateString()} @ {booking.start_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        booking.status === "confirmed" ? "default" :
                        booking.status === "pending" ? "secondary" :
                        booking.status === "completed" ? "outline" : "destructive"
                      } className="capitalize text-[10px] font-black rounded-lg">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold mb-4 uppercase text-xs tracking-widest">Planning a special occasion?</p>
                <Button asChild variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px]">
                  <Link href="/offers-events">Reserve a Space</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
