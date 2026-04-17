"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getStaffPerformance() {
  const supabase = await createClient()

  // 1. Get all staff profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_admin, is_chef, is_rider, is_accountant, is_suspended, created_at")
    .not("role", "eq", "customer")

  if (profilesError) throw new Error(profilesError.message)

  const staffPerformance = await Promise.all(
    profiles.map(async (profile) => {
      // 2. Sales Performance (from orders or captain_orders)
      // We'll check both public.orders and public.captain_orders if they exist
      const { data: orders } = await supabase
        .from("orders")
        .select("total")
        .eq("created_by", profile.id)
        .eq("status", "completed")

      const totalSales = orders?.reduce((sum, order) => sum + (Number(order.total || (order as any).total_price) || 0), 0) || 0

      // 3. Referral Tracking
      // Assuming referred clients have a 'referred_by' field in profiles
      const { count: referredCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", profile.id)

      // 4. Shift Performance (Start/End times)
      const { data: shifts } = await supabase
        .from("staff_shifts")
        .select("*")
        .eq("user_id", profile.id)
        .order("start_time", { ascending: false })

      // 5. Attendance / Days Missed
      // Simple logic: count days in the last 30 days without a shift or report
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const activeDays = new Set(
        shifts
          ?.filter(s => new Date(s.start_time) > thirtyDaysAgo)
          .map(s => new Date(s.start_time).toDateString())
      ).size

      const daysMissed = Math.max(0, 30 - activeDays)

      // 6. Extra Hours (Clocked > 8 hours)
      const extraHours = shifts?.reduce((sum, shift) => {
        if (shift.start_time && shift.end_time) {
          const duration = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)
          return sum + Math.max(0, duration - 8)
        }
        return sum
      }, 0) || 0

      return {
        ...profile,
        totalSales,
        referredCount: referredCount || 0,
        recentShifts: shifts || [],
        daysMissed,
        activeDays,
        extraHours
      }
    })
  )

  return staffPerformance
}

export async function toggleStaffSuspension(userId: string, isSuspended: boolean) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if current user is admin
    const { data: adminProfile } = await supabase.from("profiles").select("role, is_admin").eq("id", user?.id).single()
    if (!adminProfile?.is_admin && adminProfile?.role !== 'admin') {
      return { success: false, error: "Unauthorized" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_suspended: isSuspended })
      .eq("id", userId)

    if (error) throw error

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error: any) {
    console.error("Error toggling staff suspension:", error)
    return { success: false, error: error.message }
  }
}
