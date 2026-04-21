"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { transmitToEtims } from "@/lib/kra/etims-service"

export async function updateOrderStatus(orderId: string, newStatus: string, additionalUpdates: any = {}) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is authorized (admin, chef, or rider) using admin client to avoid join failures
    const { data: profile } = await adminSupabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile) {
      return { success: false, error: "Profile not found" }
    }

    // Check permissions based on role
  const canUpdate = profile.is_admin || ["admin", "chef", "rider", "accountant"].includes(profile.role)
  if (!canUpdate) {
    return { success: false, error: "Not authorized to update orders" }
  }

  const updateData: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
    ...additionalUpdates,
  }

    // Add default timestamp fields based on status if not provided in additionalUpdates
    switch (newStatus) {
      case "approved":
      case "received":
        if (!updateData.accountant_approved_at) updateData.accountant_approved_at = new Date().toISOString()
        break
      case "cooking":
      case "processing":
      case "preparing":
        if (!updateData.cooking_started_at) updateData.cooking_started_at = new Date().toISOString()
        if (!updateData.chef_started_at) updateData.chef_started_at = new Date().toISOString()
        break
      case "ready":
      case "complete":
        if (!updateData.cooking_completed_at) updateData.cooking_completed_at = new Date().toISOString()
        if (!updateData.chef_completed_at) updateData.chef_completed_at = new Date().toISOString()
        break
      case "out_for_delivery":
      case "on_transit":
      case "ready_for_collection":
        if (!updateData.delivery_started_at) updateData.delivery_started_at = new Date().toISOString()
        if (!updateData.rider_picked_at) updateData.rider_picked_at = new Date().toISOString()
        break
      case "delivered":
      case "served":
        if (!updateData.rider_delivered_at) updateData.rider_delivered_at = new Date().toISOString()
        break
    }

    // Update order status using admin client to bypass RLS restrictions and potential "permission denied for table users"
    const { error } = await adminSupabase.from("orders").update(updateData).eq("id", orderId).select()

    if (error) {
      console.error("[v0] Error updating order status:", JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    // Trigger eTIMS sync if the order is completed/delivered/served
    if (["completed", "delivered", "served", "ready"].includes(newStatus)) {
      // Run in background
      transmitToEtims(orderId).catch(err => {
        console.error("Background eTIMS sync failed:", err.message)
      })
    }

    // Refresh the path to ensure UI updates
    const { revalidatePath } = await import("next/cache")
    revalidatePath("/orders")
    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/admin/orders")

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in updateOrderStatus:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function assignStaff(orderId: string, staffType: "chef" | "rider" | "accountant", staffId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is admin
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return { success: false, error: "Not authorized as admin" }
    }

    // Prepare update data
    const fieldMap: Record<string, string> = {
      chef: "assigned_chef_id",
      rider: "assigned_rider_id",
      accountant: "assigned_accountant_id",
    }

    const updateData = {
      [fieldMap[staffType]]: staffId,
    }

    // Update order
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId).select()

    if (error) {
      console.error("[v0] Error assigning staff:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in assignStaff:", error)
    return { success: false, error: "An error occurred" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const adminSupabase = await createAdminClient()

    const {
      data: { user },
    } = await adminSupabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify user is admin
    const { data: profile } = await adminSupabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile?.is_admin && profile?.role !== 'admin') {
      return { success: false, error: "Not authorized to delete orders" }
    }

    // First delete order items (though there should be a Cascade delete if configured in DB)
    await adminSupabase.from("order_items").delete().eq("order_id", orderId)
    
    // Delete the order
    const { error } = await adminSupabase.from("orders").delete().eq("id", orderId)

    if (error) {
      console.error("[v0] Error deleting order:", error)
      return { success: false, error: error.message }
    }

    // Refresh the paths
    const { revalidatePath } = await import("next/cache")
    revalidatePath("/admin/orders")

    return { success: true }
  } catch (error) {
    console.error("[v0] Exception in deleteOrder:", error)
    return { success: false, error: "An error occurred during deletion" }
  }
}
