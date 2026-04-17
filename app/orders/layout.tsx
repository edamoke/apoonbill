import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomerSidebar } from "@/components/customer/customer-sidebar"

export default async function OrdersLayout({
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

  return (
    <div className="flex flex-1 min-h-[calc(100vh-65px)]">
      <CustomerSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
