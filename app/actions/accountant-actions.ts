"use server"

import { createClient } from "@/lib/supabase/server"
import { processInventoryUsage } from "./inventory-actions"

export async function approveOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is accountant
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile?.is_accountant && profile?.role !== "accountant" && !profile?.is_admin) {
      return { success: false, error: "Not authorized" }
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "received",
        accountant_approved_at: new Date().toISOString(),
        assigned_accountant_id: user.id,
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error approving order:", error)
      return { success: false, error: error.message }
    }

    // Process inventory usage when order is approved
    await processInventoryUsage(orderId)

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in approveOrder:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function rejectOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is accountant
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile?.is_accountant && profile?.role !== "accountant" && !profile?.is_admin) {
      return { success: false, error: "Not authorized" }
    }

    // Update order status to rejected
    const { error } = await supabase
      .from("orders")
      .update({
        status: "rejected",
        assigned_accountant_id: user.id,
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error rejecting order:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in rejectOrder:", error)
    return { success: false, error: "An error occurred" }
  }
}
