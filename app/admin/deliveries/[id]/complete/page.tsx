import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, User } from "lucide-react"
import { SignatureCapture } from "@/components/admin/signature-capture"

export default async function CompleteDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_rider) {
    redirect("/admin")
  }

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).eq("status", "delivering").single()

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/deliveries">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deliveries
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-serif font-bold">Complete Delivery</h1>
          <p className="text-muted-foreground mt-2">Collect customer signature to confirm delivery</p>
        </div>

        {/* Order Info */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold">Order Details</h2>
            <Badge className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customer_name || "Guest"}</span>
            </div>
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
                <span className="text-muted-foreground">{order.delivery_address}</span>
              </div>
            )}
            <div className="pt-3 border-t">
              <span className="text-muted-foreground">Total Amount: </span>
              <span className="text-xl font-bold text-primary">Ksh {Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Signature Capture */}
        <SignatureCapture orderId={order.id} />
      </div>
    </div>
  )
}
