"use server"

import { createClient } from "@/lib/supabase/server"

export async function pickupOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is rider or admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile || (profile.role !== "rider" && !profile.is_admin)) {
      return { success: false, error: "Not authorized as rider" }
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "out_for_delivery",
        rider_picked_at: new Date().toISOString(),
        assigned_rider_id: user.id,
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error picking up order:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in pickupOrder:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is rider or admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile || (profile.role !== "rider" && !profile.is_admin)) {
      return { success: false, error: "Not authorized as rider" }
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        rider_delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()

    if (error) {
      console.error("[v0] Error delivering order:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in deliverOrder:", error)
    return { success: false, error: "An error occurred" }
  }
}
