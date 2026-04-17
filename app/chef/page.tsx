import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { KitchenDisplaySystem } from "@/components/chef/kitchen-display-system"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ChefDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, email_confirmed, is_admin")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "chef" && !profile?.is_admin && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get orders that need chef attention
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name
        )
      )
    `)
    .in("status", ["approved", "cooking", "ready", "received", "processing", "complete"])
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2">Kitchen Display System</h1>
            <p className="text-muted-foreground">Live order preparation and fulfillment tracking</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/chef/notifications">Notifications</Link>
            </Button>
          </div>
        </div>

        <KitchenDisplaySystem initialOrders={orders as any || []} />
      </main>
    </div>
  )
}
// Force re-compile
