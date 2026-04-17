"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCaptainOrder(tableNumber: string, notes?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data, error } = await supabase.from("captain_orders").insert({
      table_number: tableNumber,
      captain_id: user.id,
      notes,
      status: "pending"
    }).select().single()

    if (error) throw error
    revalidatePath("/admin/captain-orders")
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateCaptainOrderStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("captain_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
    revalidatePath("/admin/captain-orders")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function linkOrderToCaptainOrder(orderId: string, captainOrderId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("orders")
      .update({ captain_order_id: captainOrderId })
      .eq("id", orderId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
