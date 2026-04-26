"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { startCooking, markOrderReady } from "@/app/actions/chef-actions"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, ChefHat, Timer, AlertCircle, Utensils, Volume2, BellRing } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAudioAlert } from "@/hooks/use-audio-alert"

interface Order {
  id: string
  status: string
  notes: string | null
  created_at: string
  order_items: Array<{
    id: string
    product_id: string
    quantity: number
    price_at_time: number
    products: {
       name: string
    }
  }>
}

export function KitchenDisplaySystem({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loading, setLoading] = useState<string | null>(null)
  const [hasNewOrder, setHasNewOrder] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const { playAlert, unlock, isUnlocked } = useAudioAlert()

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('kds_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        console.log("[KDS] Real-time update received:", payload)
        
        if (payload.eventType === 'INSERT') {
          // Note: In a real app, you might need to fetch the full order with items here
          // For now, we'll wait for the next full refresh or manual update
          console.log("[KDS] New order detected, triggering alert")
          playAlert()
          setHasNewOrder(true)
          router.refresh()
        } else if (payload.eventType === 'UPDATE') {
          setOrders(currentOrders => 
            currentOrders.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setOrders(currentOrders => 
            currentOrders.filter(order => order.id !== payload.old.id)
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleStartCooking = async (orderId: string) => {
    setLoading(orderId)
    // Optimistic update
    setOrders(current => 
      current.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o)
    )
    
    const result = await startCooking(orderId)
    if (result.success) {
      toast({ title: "Kitchen Notified", description: "Order preparation started." })
      // No router.refresh() needed as state is updated locally and sync'd via subscription
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      // Revert optimistic update on error
      router.refresh()
    }
    setLoading(null)
  }

  const handleMarkReady = async (orderId: string) => {
    setLoading(orderId)
    // Optimistic update
    setOrders(current => 
      current.map(o => o.id === orderId ? { ...o, status: 'ready' } : o)
    )

    const result = await markOrderReady(orderId)
    if (result.success) {
      toast({ title: "Order Ready", description: "Fulfillment team has been notified." })
      // No router.refresh() needed
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      // Revert optimistic update
      router.refresh()
    }
    setLoading(null)
  }

  const OrderTile = ({ order }: { order: Order }) => {
    const minutesSinceCreated = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)
    const isUrgent = minutesSinceCreated > 20

    return (
      <Card className={`border-2 ${isUrgent ? 'border-red-500 bg-red-50/10' : 'border-border'}`}>
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div>
            <Badge variant="outline" className="mb-1 font-mono">#{order.id.slice(0, 5).toUpperCase()}</Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <Clock className="h-3 w-3" />
               {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               {isUrgent && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {minutesSinceCreated}m</span>}
            </div>
          </div>
          <Badge variant={order.status === 'cooking' ? 'default' : 'secondary'}>{order.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 min-h-[100px]">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-muted/30 p-2 rounded">
                <span className="font-bold text-sm">{item.quantity}x {item.products?.name}</span>
                <Utensils className="h-3 w-3 opacity-20" />
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="text-[10px] bg-yellow-100/50 p-2 rounded border border-yellow-200 italic">
               Note: {order.notes}
            </div>
          )}

          <div className="pt-2">
            {order.status === 'approved' || order.status === 'received' ? (
              <Button 
                className="w-full h-12 text-lg font-bold" 
                onClick={() => handleStartCooking(order.id)}
                disabled={loading === order.id}
              >
                <ChefHat className="mr-2 h-5 w-5" /> START
              </Button>
            ) : (
              <Button 
                className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" 
                onClick={() => handleMarkReady(order.id)}
                disabled={loading === order.id}
              >
                <CheckCircle className="mr-2 h-5 w-5" /> READY
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const incoming = orders.filter(o => o.status === 'approved' || o.status === 'received')
  const inProgress = orders.filter(o => o.status === 'cooking' || o.status === 'processing')

  return (
    <div className="flex flex-col gap-6">
      {/* Audio Unlock Overlay */}
      {!isUnlocked && (
        <div className="bg-primary/10 border-2 border-primary border-dashed rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <BellRing className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold mb-2">Enable Kitchen Notifications</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            To ensure the kitchen hears a loud bell when a new order arrives, please click the button below.
          </p>
          <Button size="lg" onClick={unlock} className="font-bold gap-2">
            <Volume2 className="h-5 w-5" /> ENABLE KITCHEN ALERTS
          </Button>
        </div>
      )}

      {/* New Order Visual Alert */}
      {hasNewOrder && (
        <div className="bg-red-600 text-white p-6 rounded-2xl text-center font-bold animate-pulse flex items-center justify-center gap-6 shadow-2xl border-4 border-white/20">
          <BellRing className="h-8 w-8" />
          <span className="text-2xl tracking-tighter">NEW ORDER INCOMING!</span>
          <Button 
            variant="outline" 
            size="lg" 
            className="bg-white text-red-600 hover:bg-white/90 border-none font-black"
            onClick={() => setHasNewOrder(false)}
          >
            ACKNOWLEDGE
          </Button>
        </div>
      )}

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* INCOMING QUEUE */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                   <Timer className="text-blue-500" /> New Orders
                </h2>
                <Badge variant="outline">{incoming.length}</Badge>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2">
                {incoming.map(order => <OrderTile key={order.id} order={order} />)}
                {incoming.length === 0 && (
                   <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                      Waiting for new orders...
                   </div>
                )}
             </div>
          </div>

          {/* IN PROGRESS QUEUE */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                   <ChefHat className="text-green-500" /> In Progress
                </h2>
                <Badge variant="outline">{inProgress.length}</Badge>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2">
                {inProgress.map(order => <OrderTile key={order.id} order={order} />)}
                {inProgress.length === 0 && (
                   <div className="col-span-full py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                      No orders currently cooking.
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  )
}
