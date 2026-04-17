import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { SiteHeader } from "@/components/navigation/site-header"

export default async function CheckoutPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/checkout")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif mb-8">Checkout</h1>
        <CheckoutForm user={user} profile={profile} />
      </main>
    </div>
  )
}
