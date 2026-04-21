import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
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
      <div className="flex flex-1 relative">
        <CustomerSidebar profile={profile} />
        <main className="flex-1 min-w-0" style={{ backgroundColor: '#EBE3D8' }}>
          <div className="container mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
