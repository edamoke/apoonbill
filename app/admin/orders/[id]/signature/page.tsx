import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default async function ViewSignaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, rider:profiles!orders_assigned_rider_id_fkey(full_name)")
    .eq("id", id)
    .single()

  if (!order || !order.delivery_signature_data) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/admin/orders/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground">Delivery Confirmation</h1>
            <p className="text-muted-foreground">Customer signature for order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-serif font-bold">Signature</h2>
          <div className="border-2 border-border rounded-lg bg-white p-4">
            <img
              src={order.delivery_signature_data || "/placeholder.svg"}
              alt="Customer Signature"
              className="w-full h-auto"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-serif font-bold">Delivery Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Customer Name</p>
              <p className="font-medium">{order.customer_signature_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Delivered By</p>
              <p className="font-medium">{order.rider?.full_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Delivery Completed</p>
              <p className="text-xs">
                {new Date(order.delivery_completed_at).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {order.delivery_notes && (
              <div>
                <p className="text-muted-foreground mb-1">Delivery Notes</p>
                <p className="text-sm bg-secondary/50 p-3 rounded">{order.delivery_notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
