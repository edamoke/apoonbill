"use server"

import { createClient } from "@/lib/supabase/server"

export async function getLowStockItems() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .lt("current_stock", "reorder_level")
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function checkAndNotifyLowStock() {
  try {
    const supabase = await createClient()
    
    // 1. Get low stock items
    const { data: lowStockItems } = await supabase
      .from("inventory_items")
      .select("*")
      .filter("current_stock", "lt", "reorder_level")

    if (lowStockItems && lowStockItems.length > 0) {
      // 2. Create notifications for admins
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .or("role.eq.admin,role.eq.accountant")

      if (admins) {
        for (const item of lowStockItems) {
          for (const admin of admins) {
            await supabase.from("notifications").insert({
              user_id: admin.id,
              title: "Low Stock Alert",
              message: `Item "${item.name}" is low on stock (${item.current_stock} ${item.unit} remaining). Reorder level is ${item.reorder_level}.`,
              type: "system"
            })
          }
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
