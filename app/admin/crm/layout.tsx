import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Use Admin Client to ensure profile is visible
  const { createAdminClient } = await import("@/lib/supabase/server")
  const adminSupabase = await createAdminClient()

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
