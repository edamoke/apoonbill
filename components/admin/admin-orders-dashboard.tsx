"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { OrderTrackingCanvas } from "@/components/customer/order-tracking-canvas"
import { Activity, LayoutDashboard, Utensils, MapPin, Trash2, AlertTriangle } from "lucide-react"
import { deleteOrder } from "@/app/actions/admin-order-actions"
import { toast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

export function AdminOrdersDashboard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isAccountantView = pathname?.startsWith('/accountant')

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to all changes in the orders table
    const channel = supabase
      .channel("admin-orders-all")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("[Admin Dashboard] Order change received:", payload)
          
          if (payload.eventType === 'INSERT') {
            router.refresh()
          } else if (payload.eventType === 'UPDATE') {
            setOrders(current => 
              current.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
            )
          } else if (payload.eventType === 'DELETE') {
            setOrders(current => 
              current.filter(o => o.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  async function handleDelete(orderId: string) {
    setIsDeleting(true)
    try {
      const result = await deleteOrder(orderId)
      if (result.success) {
        toast({ title: "Order Deleted", description: "The order has been removed successfully." })
        router.refresh()
      } else {
        toast({ title: "Deletion Failed", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred during deletion", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-500"
      case "on_transit":
      case "out_for_delivery":
        return "bg-blue-500/10 text-blue-500"
      case "processing":
      case "cooking":
        return "bg-yellow-500/10 text-yellow-500"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      case "pending":
        return "bg-orange-500/10 text-orange-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[24px] bg-card overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row md:items-stretch">
                {/* Left Side: Order Info */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {order.order_type === 'pos' ? <Utensils className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-black font-mono text-sm tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge className={cn("text-[9px] uppercase font-black px-2 py-0.5 border-none", getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] uppercase font-black px-2 py-0.5">
                            {order.order_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full h-8 px-4 border-2 font-bold text-[10px] uppercase tracking-widest gap-2">
                            <Activity className="h-3.5 w-3.5 text-red-500" />
                            Live Tracking
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-[#111111] border-none p-0 overflow-hidden rounded-[32px]">
                          <div className="p-8">
                            <DialogHeader className="mb-6">
                              <DialogTitle className="text-white text-2xl font-black uppercase flex items-center gap-3">
                                <span className="bg-red-600 p-1.5 rounded-lg text-xs tracking-normal">LIVE</span>
                                Graphical Order Status
                              </DialogTitle>
                            </DialogHeader>
                            <OrderTrackingCanvas order={order} />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {order.status === 'cancelled' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-full">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[24px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Confirm Deletion
                              </DialogTitle>
                              <p className="text-sm text-muted-foreground mt-2">
                                Are you sure you want to permanently delete cancelled order <b>#{order.id.slice(0, 8).toUpperCase()}</b>? 
                                This will free up system space and remove all associated records. This action cannot be undone.
                              </p>
                            </DialogHeader>
                            <DialogFooter className="mt-6">
                               <Button variant="outline" className="rounded-xl">Cancel</Button>
                               <Button 
                                variant="destructive" 
                                className="rounded-xl"
                                onClick={() => handleDelete(order.id)}
                                disabled={isDeleting}
                               >
                                {isDeleting ? "Deleting..." : "Permanently Delete"}
                               </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Customer Details</p>
                      <p className="text-sm font-black text-slate-900">{order.customer_name || "Guest Customer"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Timeline</p>
                      <p className="text-xs font-bold text-slate-700">Placed {new Date(order.created_at).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Financials & CTA */}
                <div className="bg-slate-50 md:w-64 p-6 flex flex-col justify-between border-l border-slate-100">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">Order Value</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">Ksh {Number(order.total).toLocaleString()}</p>
                    {order.payment_status === 'paid' && (
                      <div className="inline-flex items-center gap-1.5 text-green-600 font-black text-[9px] uppercase mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Fully Paid
                      </div>
                    )}
                  </div>

                  <Button asChild size="lg" className="w-full rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 mt-4">
                    <Link href={`${isAccountantView ? '/accountant' : '/admin'}/orders/${order.id}`}>Manage Order</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="border-border border-dashed bg-muted/5 rounded-[32px]">
          <CardContent className="py-20 text-center space-y-3">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-50 text-2xl">📋</div>
            <h3 className="text-lg font-medium text-muted-foreground">No orders found</h3>
            <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto font-medium">
              Orders will appear here in real-time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
