import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { StaffPerformanceTable } from "@/components/admin/staff-performance-table"
import { getStaffPerformance } from "@/app/actions/employee-performance-actions"

export default async function AdminStaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Allowed roles: admin, accountant, hrm
  const isAllowed = profile?.is_admin || 
                    profile?.role === "admin" || 
                    profile?.is_accountant || 
                    profile?.role === "accountant" || 
                    profile?.role === "hrm"

  if (!isAllowed) {
    redirect("/dashboard")
  }

  const staffPerformanceData = await getStaffPerformance()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2">Staff Management</h1>
            <p className="text-muted-foreground">Monitor staff performance, referrals, and attendance</p>
          </div>
        </div>

        <StaffPerformanceTable data={staffPerformanceData} />
      </main>
    </div>
  )
}
