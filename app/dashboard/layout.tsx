import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffHeader } from "@/components/navigation/staff-header"
import { CustomerSidebar } from "@/components/customer/customer-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StaffHeader user={user} profile={profile} />

      <div className="flex flex-1 relative">
        <CustomerSidebar profile={profile} />
        <main className="flex-1 min-w-0 bg-muted/20">
          <div className="container mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
