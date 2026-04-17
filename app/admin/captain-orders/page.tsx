import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ClipboardList, Plus, Utensils, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CaptainOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Floor staff or admin can access
  if (!profile?.is_admin && profile?.role !== 'admin' && profile?.role !== 'staff') {
    // Basic role check - in a real app, 'staff' or 'captain' role would be used
  }

  const { data: activeOrders } = await supabase
    .from("captain_orders")
    .select("*, profiles(full_name)")
    .neq("status", "served")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Captain Orders</h1>
            <p className="text-muted-foreground">Floor staff table management and ordering</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/captain-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Table Order
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeOrders?.map((order) => (
          <Card key={order.id} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
               <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                 order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                 order.status === 'sent_to_kitchen' ? 'bg-blue-100 text-blue-700' :
                 'bg-gray-100 text-gray-700'
               }`}>
                 {order.status.replace('_', ' ')}
               </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {order.table_number}
              </div>
              <div>
                <h3 className="font-bold">Table {order.table_number}</h3>
                <p className="text-xs text-muted-foreground">Captain: {order.profiles?.full_name || 'Unknown'}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground italic">
                {order.notes || 'No special instructions'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Created {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                Edit Items
              </Button>
              <Button size="sm" className="text-xs">
                Bill Table
              </Button>
            </div>
          </Card>
        ))}

        {(!activeOrders || activeOrders.length === 0) && (
          <Card className="p-12 text-center text-muted-foreground col-span-full border-dashed">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No active table orders. Start a new one to begin service.</p>
          </Card>
        )}
      </div>

      <div className="pt-8">
         <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Recent History</h2>
         </div>
         <Card className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Historical orders and shift summaries will appear here.</p>
         </Card>
      </div>
    </div>
  )
}
