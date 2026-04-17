"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateOrderStatus } from "@/app/actions/admin-order-actions"
import { useRouter } from "next/navigation"
import { MapPin, Phone, CheckCircle, Package, Utensils, Navigation } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  status: string
  delivery_type: string
  delivery_address: string | null
  total: number
  created_at: string
  originator: {
     full_name: string
     phone: string | null
  }
  order_items: Array<{
    id: string
    quantity: number
    products: {
       name: string
    }
  }>
}

export function WaiterFulfillmentBoard({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const channel = supabase
      .channel('fulfillment_updates')
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

   const handlePickUp = async (orderId: string) => {
    setLoading(orderId)
    const order = orders.find(o => o.id === orderId)
    const nextStatus = order?.delivery_type === 'delivery' 
       ? 'on_transit' 
       : 'ready_for_collection'

    const result = await updateOrderStatus(orderId, nextStatus, {
       delivery_started_at: new Date().toISOString(),
       rider_picked_at: new Date().toISOString(),
       status: nextStatus // Explicitly update status
    })
    
    if (result.success) {
      toast({ 
        title: order?.delivery_type === 'delivery' ? "Trip Started" : "Collection Started", 
        description: order?.delivery_type === 'delivery' ? "Safe travels! You have started the delivery trip." : "Order is being brought to the table." 
      })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(null)
  }

  const handleComplete = async (orderId: string) => {
    setLoading(orderId)
    const order = orders.find(o => o.id === orderId)
    const finalStatus = order?.delivery_type === 'dine_in' 
       ? 'served' 
       : 'delivered'

    const result = await updateOrderStatus(orderId, finalStatus, {
       rider_delivered_at: new Date().toISOString(),
       status: finalStatus // Ensure status is explicitly passed
    })
    if (result.success) {
      toast({ 
        title: order?.delivery_type === 'delivery' ? "Trip Completed" : "Service Completed", 
        description: order?.delivery_type === 'delivery' ? "Great job! Delivery successfully completed." : "Order served to table." 
      })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       {orders.map((order) => (
         <Card key={order.id} className="border-t-4 border-t-primary">
            <CardHeader className="pb-3">
               <div className="flex justify-between items-start">
                  <div>
                     <CardTitle className="text-xl font-mono">#{order.id.slice(0, 5).toUpperCase()}</CardTitle>
                     <Badge variant="outline" className="mt-1 capitalize">
                        {order.delivery_type === 'dine_in' ? 'Waiter Service' : 'Delivery Rider'}
                     </Badge>
                  </div>
                  <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>{order.status}</Badge>
               </div>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-3">
                  <div className="flex items-start gap-3">
                     <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                     <div>
                        <p className="text-sm font-bold">{order.delivery_address || 'Main Hall / POS'}</p>
                        <p className="text-xs text-muted-foreground">Location / Table</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Phone className="h-5 w-5 text-muted-foreground" />
                     <div>
                        <p className="text-sm font-bold">{order.originator?.phone || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Placed by: {order.originator?.full_name || 'System'}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-muted/30 p-3 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Items to Deliver</p>
                  {order.order_items?.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-xs">
                        <span className="font-medium">{item.quantity}x {item.products?.name}</span>
                        <Package className="h-3 w-3 opacity-20" />
                     </div>
                  ))}
               </div>

               <div className="pt-2">
                  {order.status === 'ready' ? (
                     <Button 
                       className="w-full h-12 text-lg font-bold gap-2 animate-pulse shadow-lg shadow-primary/20"
                       onClick={() => handlePickUp(order.id)}
                       disabled={loading === order.id}
                     >
                        <Navigation className="h-5 w-5" /> {order.delivery_type === 'delivery' ? 'START TRIP' : 'PICK UP'}
                     </Button>
                  ) : (
                     <Button 
                       className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 gap-2"
                       onClick={() => handleComplete(order.id)}
                       disabled={loading === order.id}
                     >
                        <CheckCircle className="h-5 w-5" /> {order.delivery_type === 'delivery' ? 'COMPLETE TRIP' : order.delivery_type === 'dine_in' ? 'SERVED' : 'DELIVERED'}
                     </Button>
                  )}
               </div>
            </CardContent>
         </Card>
       ))}

       {orders.length === 0 && (
         <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 border-2 border-dashed rounded-3xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
               <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-muted-foreground">No Pending Deliveries</h3>
               <p className="text-sm text-muted-foreground/60">Fulfillment queue is clear.</p>
            </div>
         </div>
       )}
    </div>
  )
}
