"use server"

import { createClient, validateRole } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSupplyOrder(supplierId: string, items: { inventory_item_id: string, quantity: number, unit_cost: number }[]) {
  try {
    const { user } = await validateRole(['admin', 'accountant'])
    const supabase = await createClient()

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from("supply_orders")
      .insert({
        supplier_id: supplierId,
        status: 'pending',
        created_by: user.id,
        total_amount: items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0)
      })
      .select()
      .single()

    if (orderError) throw orderError

    // 2. Insert items
    const { error: itemsError } = await supabase
      .from("supply_order_items")
      .insert(items.map(item => ({
        supply_order_id: order.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      })))

    if (itemsError) throw itemsError

    revalidatePath("/admin/inventory/supply-orders")
    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("Error creating supply order:", error)
    return { success: false, error: error.message }
  }
}

export async function updateSupplyOrderStatus(orderId: string, status: 'pending' | 'delivered' | 'failed' | 'cancelled') {
  try {
    await validateRole(['admin', 'accountant'])
    const supabase = await createClient()

    // Get current order status
    const { data: order, error: fetchError } = await supabase
      .from("supply_orders")
      .select("status")
      .eq("id", orderId)
      .single()

    if (fetchError) throw fetchError

    // Only proceed if status is changing to delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      // 1. Get order items
      const { data: items, error: itemsError } = await supabase
        .from("supply_order_items")
        .select("inventory_item_id, quantity")
        .eq("supply_order_id", orderId)

      if (itemsError) throw itemsError

      // 2. Update stock for each item (Manual update since DB trigger might be missing)
      for (const item of items) {
        const { data: invItem } = await supabase
          .from("inventory_items")
          .select("current_stock")
          .eq("id", item.inventory_item_id)
          .single()

        const newStock = (invItem?.current_stock || 0) + item.quantity

        await supabase
          .from("inventory_items")
          .update({ current_stock: newStock })
          .eq("id", item.inventory_item_id)

        // 3. Log transaction
        await supabase.from("inventory_transactions").insert({
          inventory_item_id: item.inventory_item_id,
          type: 'restock',
          quantity: item.quantity,
          reference_id: orderId,
          notes: `Restock from supply order ${orderId}`
        })
      }
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("supply_orders")
      .update({ 
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null
      })
      .eq("id", orderId)

    if (updateError) throw updateError

    revalidatePath("/admin/inventory/supply-orders")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating supply order status:", error)
    return { success: false, error: error.message }
  }
}
