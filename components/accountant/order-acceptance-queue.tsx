"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateOrderStatus } from "@/app/actions/admin-order-actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Clock, CheckCircle, XCircle, CreditCard, Banknote, Smartphone, HandCoins } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface Order {
  id: string
  status: string
  total_price: number
  payment_method: string
  payment_status: string
  delivery_type: string
  created_at: string
  profiles: {
     full_name: string
  }
}

export function OrderAcceptanceQueue({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const channel = supabase
      .channel('acceptance_updates')
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

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleAcceptOrder = async (orderId: string) => {
    setLoading(orderId)
    // Move to 'approved' status which sends it to KDS
    const result = await updateOrderStatus(orderId, 'approved', { payment_status: 'paid' })
    if (result.success) {
      toast({ title: "Order Accepted", description: "Payment verified. Order sent to kitchen." })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(null)
  }

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to reject/cancel this order?")) return
    setLoading(orderId)
    const result = await updateOrderStatus(orderId, 'cancelled')
    if (result.success) {
      toast({ title: "Order Rejected", description: "Order has been cancelled.", variant: "destructive" })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(null)
  }

  const getPaymentIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'mpesa': return <Smartphone className="h-4 w-4 text-green-600" />
      case 'card': return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'cash': return <Banknote className="h-4 w-4 text-emerald-600" />
      default: return <HandCoins className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold">Pending Acceptance</h2>
         <Badge variant="secondary">{orders.length} items</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {orders.map((order) => (
           <Card key={order.id} className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
              <CardHeader className="pb-3">
                 <div className="flex items-start justify-between">
                    <div>
                       <CardTitle className="text-lg font-mono">#{order.id.slice(0,8).toUpperCase()}</CardTitle>
                       <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleTimeString()}
                       </CardDescription>
                    </div>
                    <Badge className="capitalize">{order.delivery_type}</Badge>
                 </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="space-y-1">
                       <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Amount Due</p>
                       <p className="text-xl font-black">{formatCurrency(order.total_price)}</p>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-1.5 mb-1">
                          {getPaymentIcon(order.payment_method)}
                          <span className="text-xs font-bold capitalize">{order.payment_method}</span>
                       </div>
                       <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'} className="text-[10px]">
                          {order.payment_status}
                       </Badge>
                    </div>
                 </div>

                 <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">By: <span className="text-foreground font-medium">{order.profiles?.full_name || 'Guest'}</span></p>
                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary">
                       <Link href={`/accountant/orders/${order.id}`}>View Details</Link>
                    </Button>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRejectOrder(order.id);
                      }}
                      disabled={loading === order.id}
                    >
                       <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAcceptOrder(order.id);
                      }}
                      disabled={loading === order.id}
                    >
                       <CheckCircle className="mr-2 h-4 w-4" /> Accept
                    </Button>
                 </div>
              </CardContent>
           </Card>
         ))}

         {orders.length === 0 && (
           <div className="col-span-full py-20 text-center space-y-4 border-2 border-dashed rounded-3xl">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                 <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-muted-foreground">All Caught Up!</h3>
                 <p className="text-sm text-muted-foreground/60">No orders waiting for acceptance.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  )
}
