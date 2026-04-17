"use server"

import { createClient } from "@/lib/supabase/server"

export async function startCooking(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is chef or admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile || (profile.role !== "chef" && !profile.is_admin)) {
      return { success: false, error: "Not authorized as chef" }
    }

    const { createAdminClient } = await import("@/lib/supabase/server")
    const adminSupabase = await createAdminClient()

    const { error } = await adminSupabase
      .from("orders")
      .update({
        status: "cooking",
        chef_started_at: new Date().toISOString(),
        assigned_chef_id: user.id,
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error starting cooking:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in startCooking:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function markOrderReady(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is chef or admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile || (profile.role !== "chef" && !profile.is_admin)) {
      return { success: false, error: "Not authorized as chef" }
    }

    const { createAdminClient } = await import("@/lib/supabase/server")
    const adminSupabase = await createAdminClient()

    const { error } = await adminSupabase
      .from("orders")
      .update({
        status: "ready",
        chef_completed_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error marking order ready:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in markOrderReady:", error)
    return { success: false, error: "An error occurred" }
  }
}
