import { FinancialCharts } from "@/components/admin/reports/financial-charts"
import { IotMonitors } from "@/components/admin/reports/iot-monitors"
import { ReportsNavigation } from "@/components/admin/reports/reports-navigation"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/rbac"

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const canView = await hasPermission('accounting', 'view')

  if (!canView) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Accounting Reports Dashboard</h2>
      </div>
      
      <div className="space-y-4">
        <section>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground italic">Supply & Financial Overview</h3>
          <FinancialCharts />
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground italic">IoT Monitoring (ESP32)</h3>
          <IotMonitors />
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-muted-foreground italic">Operational Reports & Shift Management</h3>
          <ReportsNavigation />
        </section>
      </div>
    </div>
  )
}
