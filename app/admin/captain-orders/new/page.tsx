import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CaptainOrderForm } from "@/components/admin/captain-order-form"

export default async function NewCaptainOrderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Allowed roles: admin, staff, floor_captain
  const isAllowed = profile?.is_admin || 
                    profile?.role === "admin" || 
                    profile?.role === "staff" ||
                    profile?.role === "captain"

  if (!isAllowed) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif mb-2">Initiate Table Service</h1>
          <p className="text-muted-foreground">Assign a table number to start a new captain order.</p>
        </div>

        <CaptainOrderForm />
      </main>
    </div>
  )
}
