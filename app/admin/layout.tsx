import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ChatWidget } from "@/components/chat/chat-widget"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user has any admin role
  const hasAdminAccess =
    profile?.is_admin || 
    profile?.role === "admin" ||
    profile?.role === "accountant" ||
    profile?.role === "chef" ||
    profile?.role === "rider" ||
    profile?.is_accountant || 
    profile?.is_chef || 
    profile?.is_rider ||
    !!profile?.custom_role_id

  if (!hasAdminAccess) {
    redirect("/admin/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        userRole={profile?.role || "user"}
        isAdmin={profile?.is_admin || profile?.role === "admin"}
        isChef={profile?.is_chef}
        isRider={profile?.is_rider}
        isAccountant={profile?.is_accountant}
      />
      <main className="lg:pl-64">
        <AdminHeader user={user} profile={profile} />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
      <ChatWidget title="The Spoonbill Admin Assistant" />
    </div>
  )
}
