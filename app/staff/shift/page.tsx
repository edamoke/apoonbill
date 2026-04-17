import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { UserCircle, LogIn, LogOut, Clock, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getActiveShift } from "@/app/actions/shift-actions"
import { DailyReportForm } from "@/components/staff/daily-report-form"
import { getEmployeeReports } from "@/app/actions/employee-actions"

export default async function StaffShiftPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!['waiter', 'barman', 'cashier', 'admin'].includes(profile?.role || '')) {
    redirect("/")
  }

  const activeShift = await getActiveShift(user.id)

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
          <p className="text-muted-foreground capitalize">{profile?.role} Role</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {!activeShift ? (
          <Card className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <LogIn className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Start Your Shift</h2>
              <p className="text-muted-foreground mt-2">Ready to start serving? Log in to track your sales and orders.</p>
            </div>
            <Button size="lg" className="w-full h-14 text-lg">
              Check In Now
            </Button>
          </Card>
        ) : (
          <Card className="p-8 flex flex-col items-center text-center space-y-6 border-primary bg-primary/5">
            <div className="p-4 bg-primary/10 rounded-full">
              <Clock className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Active Shift</h2>
              <p className="text-muted-foreground mt-2">Started at {new Date(activeShift.start_time).toLocaleTimeString()}</p>
            </div>
            <div className="w-full pt-4 space-y-3">
               <Button variant="outline" size="lg" className="w-full h-14 text-lg" asChild>
                  <a href="/pos">Go to POS</a>
               </Button>
               <Button variant="destructive" size="lg" className="w-full h-14 text-lg">
                  <LogOut className="mr-2 h-5 w-5" />
                  End Shift
               </Button>
            </div>
          </Card>
        )}

        {activeShift && (
          <DailyReportForm shiftId={activeShift.id} />
        )}

        <Card className="p-8 space-y-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              Recent Shift History
           </h2>
           <div className="space-y-4">
              <div className="p-4 border rounded-lg flex justify-between items-center">
                 <div>
                    <p className="font-bold">Dec 27, 2025</p>
                    <p className="text-xs text-muted-foreground">08:00 AM - 04:00 PM</p>
                 </div>
                 <div className="text-right">
                    <p className="font-bold text-primary">Ksh 12,450</p>
                    <p className="text-[10px] text-muted-foreground">24 Orders</p>
                 </div>
              </div>
              <p className="text-center text-sm text-muted-foreground italic">
                Only your last 5 shifts are shown here.
              </p>
           </div>
        </Card>
      </div>
    </div>
  )
}
