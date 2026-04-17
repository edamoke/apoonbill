import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { OrderStatusTimeline } from "@/components/admin/order-status-timeline"
import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/app/actions/admin-order-actions"
import { revalidatePath } from "next/cache"
import { ArrowLeft, CheckCircle, XCircle, Printer, Split, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default async function AccountantOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAllowed = 
    profile?.is_admin || 
    profile?.role === 'admin' || 
    profile?.is_accountant || 
    profile?.role === 'accountant'

  if (!isAllowed) {
    console.log("[Accountant Order Detail] Access denied. Profile:", profile);
    redirect("/dashboard")
  }

  const { id } = await params
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*)), profiles(*)")
    .eq("id", id)
    .single()

  if (error || !order) {
    notFound()
  }

  async function handleApprove() {
    "use server"
    await updateOrderStatus(id, 'approved', { payment_status: 'completed' })
    revalidatePath(`/accountant/orders/${id}`)
    revalidatePath("/accountant")
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Stable Accountant Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - Order Management</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/accountant">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
               <h2 className="text-xl font-bold mb-4">Tracking & Status</h2>
               <OrderStatusTimeline order={order} />
            </Card>

            {order.status === 'pending' && (
              <Card className="p-6 border-primary/20 bg-primary/5">
                <h2 className="text-xl font-bold mb-4">Accountant Approval Required</h2>
                <p className="text-muted-foreground mb-6">
                  This order is waiting for financial verification. Approving will send it to the kitchen.
                </p>
                <div className="flex gap-4">
                  <form action={handleApprove}>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Approve Order
                    </Button>
                  </form>
                  <Button size="lg" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="mr-2 h-5 w-5" />
                    Reject Order
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
             <Card className="p-6 border-amber-200 bg-amber-50/50">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Button className="w-full justify-start h-12 bg-white hover:bg-muted text-foreground border-amber-200" variant="outline">
                     <Printer className="mr-2 h-5 w-5 text-amber-600" /> Print Receipt
                  </Button>
                  <Button className="w-full justify-start h-12 bg-white hover:bg-muted text-foreground border-amber-200" variant="outline">
                     <Split className="mr-2 h-5 w-5 text-amber-600" /> Split Bill
                  </Button>
                </div>
             </Card>

             <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Financial Overview</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Ksh {order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>Ksh {order.delivery_fee?.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>Ksh {order.total?.toFixed(2)}</span>
                  </div>
                </div>
             </Card>

             <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Payment Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Method</p>
                    <p className="font-medium capitalize">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                    <p className="font-medium capitalize">{order.payment_status}</p>
                  </div>
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
