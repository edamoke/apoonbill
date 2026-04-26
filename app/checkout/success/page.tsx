import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { LiveOrderTracking } from "@/components/customer/live-order-tracking"
import { SocialSubmissionForm } from "@/components/loyalty/social-submission-form"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  // Use admin client for initial fetch to ensure data is available regardless of session propagation
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()
  
  const { data: order, error } = await adminSupabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.order_id)
    .single()

  if (error || !order) {
    console.error("[Checkout Success] Order not found:", params.order_id, error)
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-serif">Order Placed Successfully!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Thank you for your order. We've received it and are starting to prepare it.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Order ID</p>
              <p className="font-mono text-lg bg-secondary/30 inline-block px-4 py-1 rounded-full border border-border/50">
                #{order.id.toUpperCase()}
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <LiveOrderTracking order={order} />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-medium mb-4">Order Details</h3>
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.item_name} x {item.quantity}
                    </span>
                    <span>Ksh {Number(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-primary">Ksh {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user && (
                <Button className="flex-1" asChild>
                  <Link href={`/orders/${order.id}`}>View Full Details</Link>
                </Button>
              )}
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/menu">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <SocialSubmissionForm />
      </div>
    </div>
  )
}
