
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getRoles, getModules } from "@/app/actions/rbac-actions"
import { AccessControlManager } from "@/components/admin/access-control-manager"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AccessControlPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin && profile?.role !== 'admin') {
    redirect("/dashboard")
  }

  const [roles, modules] = await Promise.all([
    getRoles(),
    getModules()
  ])

  return (
    <div className="flex flex-col min-h-screen bg-background p-8">
      <AccessControlManager roles={roles} modules={modules} />
    </div>
  )
}
