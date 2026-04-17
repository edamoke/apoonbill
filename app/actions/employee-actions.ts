"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitDailyReport(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const tasks_completed = formData.get("tasks_completed") as string
    const issues_encountered = formData.get("issues_encountered") as string
    const customer_feedback = formData.get("customer_feedback") as string
    const cash_reported = parseFloat(formData.get("cash_reported") as string) || 0
    const shift_id = formData.get("shift_id") as string || null

    const { error } = await supabase.from("employee_daily_reports").insert({
      user_id: user.id,
      shift_id,
      tasks_completed,
      issues_encountered,
      customer_feedback,
      cash_reported,
    })

    if (error) throw error

    revalidatePath("/staff/shift")
    return { success: true }
  } catch (error: any) {
    console.error("Error submitting daily report:", error)
    return { success: false, error: error.message }
  }
}

export async function getEmployeeReports(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from("employee_daily_reports").select(`
      *,
      profiles:user_id (full_name)
    `).order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching reports:", error)
    return { success: false, error: error.message }
  }
}
