"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function authorizeAction(pin: string, requiredRoles: string[]) {
  try {
    const supabase = await createClient()
    
    // In a real scenario, we might have a separate PIN column or use a specific hash
    // For this implementation, we'll check if any user with the required roles has this "PIN"
    // Since we don't have a PIN column yet, we'll assume a mock check or use the last 4 digits of their ID as a mock PIN for demonstration, 
    // or better, just check the current logged in user's role if they are providing their own PIN.
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_admin, manager_pin")
      .eq("id", user.id)
      .single()

    if (!profile) return { success: false, error: "Profile not found" }

    const hasRole = profile.is_admin || requiredRoles.includes(profile.role)
    
    // Secure PIN check against database
    if (profile.manager_pin !== pin) {
      return { success: false, error: "Invalid Manager PIN" }
    }

    if (!hasRole) {
      return { success: false, error: "Unauthorized for this action" }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logAuditAction(orderId: string, actionType: string, reason: string, authorizedBy?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from("pos_audit_logs").insert({
      order_id: orderId,
      action_type: actionType,
      reason: reason,
      performed_by: user?.id,
      authorized_by: authorizedBy || user?.id
    })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateTableStatus(tableId: string, status: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("pos_tables")
      .update({ status })
      .eq("id", tableId)

    if (error) throw error
    revalidatePath("/pos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getActiveOrderForTable(tableId: string) {
  try {
    // Use Admin Client to bypass complex RLS during POS loading
    const { createAdminClient } = await import("@/lib/supabase/server")
    const supabase = await createAdminClient()
    
    // 1. Get table info
    const { data: table, error: tableError } = await supabase
      .from("pos_tables")
      .select("active_order_id, number")
      .eq("id", tableId)
      .single()

    if (tableError) throw tableError

    let activeOrderId = table?.active_order_id

    // 2. Fallback: Find unlinked pending orders for this table
    if (!activeOrderId && table?.number) {
      const { data: fallback } = await supabase
        .from("orders")
        .select("id")
        .eq("table_number", table.number)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (fallback) {
        activeOrderId = fallback.id
        // Link it back
        await supabase.from("pos_tables").update({ active_order_id: activeOrderId, status: 'occupied' }).eq("id", tableId)
      }
    }

    if (!activeOrderId) return { success: true, order: null }

    // 3. Fetch order with items using privileged client
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .eq("id", activeOrderId)
      .single()

    if (orderError) throw orderError

    return { success: true, order }
  } catch (error: any) {
    console.error("[POS] Privileged getActiveOrderForTable Error:", error)
    return { success: false, error: error.message }
  }
}

export async function changeTable(oldTableId: string, newTableId: string, orderId: string) {
  try {
    const supabase = await createClient()

    // 1. Update order table_number
    const { data: newTable } = await supabase
      .from("pos_tables")
      .select("number")
      .eq("id", newTableId)
      .single()

    await supabase
      .from("orders")
      .update({ table_number: newTable?.number })
      .eq("id", orderId)

    // 2. Clear old table
    await supabase
      .from("pos_tables")
      .update({ active_order_id: null, status: 'available' })
      .eq("id", oldTableId)

    // 3. Set new table
    await supabase
      .from("pos_tables")
      .update({ active_order_id: orderId, status: 'occupied' })
      .eq("id", newTableId)

    revalidatePath("/pos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function mergeBills(sourceTableId: string, targetTableId: string) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server")
    const supabase = await createAdminClient()

    // 1. Get both tables to find their active orders
    const { data: sourceTable } = await supabase.from("pos_tables").select("active_order_id").eq("id", sourceTableId).single()
    const { data: targetTable } = await supabase.from("pos_tables").select("active_order_id").eq("id", targetTableId).single()

    if (!sourceTable?.active_order_id || !targetTable?.active_order_id) {
      throw new Error("One or both tables do not have active orders")
    }

    const sourceOrderId = sourceTable.active_order_id
    const targetOrderId = targetTable.active_order_id

    // 2. Move items from source order to target order
    const { data: sourceItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", sourceOrderId)

    if (sourceItems && sourceItems.length > 0) {
      for (const item of sourceItems) {
        // Attempt to find a matching item in the target order to increment quantity instead of adding new line
        const { data: existing } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", targetOrderId)
          .eq("product_id", item.product_id)
          .maybeSingle()

        if (existing && JSON.stringify(existing.modifiers) === JSON.stringify(item.modifiers)) {
          await supabase
            .from("order_items")
            .update({ quantity: existing.quantity + item.quantity })
            .eq("id", existing.id)
          
          await supabase.from("order_items").delete().eq("id", item.id)
        } else {
          // Change the order_id for this item to the target order
          await supabase
            .from("order_items")
            .update({ order_id: targetOrderId })
            .eq("id", item.id)
        }
      }
    }

    // 3. Recalculate target order totals based on moved items
    const { data: allItems } = await supabase
      .from("order_items")
      .select("price, quantity")
      .eq("order_id", targetOrderId)
    
    const newSubtotal = allItems?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0
    const newTotal = newSubtotal * 1.16 // Assuming 16% tax (this should ideally match pos calculation)

    await supabase
      .from("orders")
      .update({ 
        subtotal: newSubtotal, 
        total: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq("id", targetOrderId)

    // 4. Cancel/Archive the source order
    await supabase
      .from("orders")
      .update({ 
        status: 'cancelled', 
        special_instructions: `Merged into order ${targetOrderId.slice(0,8)}` 
      })
      .eq("id", sourceOrderId)
    
    // 5. Free up the source table
    await supabase
      .from("pos_tables")
      .update({ active_order_id: null, status: 'available' })
      .eq("id", sourceTableId)

    revalidatePath("/pos")
    return { success: true }
  } catch (error: any) {
    console.error("[POS] Merge Error:", error)
    return { success: false, error: error.message }
  }
}

export async function updatePOSOrder(orderId: string, items: any[], subtotal: number, total: number, discount_percent?: number) {
  try {
    const supabase = await createClient()

    // 1. Update order totals and discount
    await supabase
      .from("orders")
      .update({ 
        subtotal, 
        total, 
        discount_percent: discount_percent ?? 0,
        updated_at: new Date() 
      })
      .eq("id", orderId)

    // 2. Delete existing items (or sync them)
    // For simplicity, we'll replace them
    await supabase.from("order_items").delete().eq("order_id", orderId)

    // 3. Insert new items
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.productId || item.id,
      quantity: item.quantity,
      price: item.price + (item.modifiers ? item.modifiers.reduce((a: number, b: any) => a + Number(b.price_override), 0) : 0),
      item_name: item.name,
      modifiers: item.modifiers || item.selectedModifiers || []
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
    if (itemsError) throw itemsError

    revalidatePath("/pos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function splitBillEqual(orderId: string, parts: number) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server")
    const supabase = await createAdminClient()
    
    // 1. Get original order and its items
    const { data: originalOrder } = await supabase.from("orders").select("*").eq("id", orderId).single()
    if (!originalOrder) throw new Error("Order not found")

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    const partTotal = Number(originalOrder.total) / parts
    const partSubtotal = Number(originalOrder.subtotal) / parts

    // 2. Create 'n' new orders
    for (let i = 0; i < parts; i++) {
      const { data: newOrder, error: orderErr } = await supabase.from("orders").insert({
        ...originalOrder,
        id: undefined,
        total: partTotal,
        subtotal: partSubtotal,
        parent_order_id: orderId,
        split_type: 'equal',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select().single()

      if (orderErr) throw orderErr

      // 3. For each new order, add items with fractional quantities
      if (items && items.length > 0) {
          const splitItems = items.map(item => ({
              ...item,
              id: undefined,
              order_id: newOrder.id,
              quantity: Number(item.quantity) / parts,
              created_at: new Date().toISOString()
          }))
          await supabase.from("order_items").insert(splitItems)
      }
    }

    // 4. Mark original order as split/archived
    await supabase.from("orders").update({ 
        status: 'cancelled', 
        special_instructions: `Split into ${parts} equal parts` 
    }).eq("id", orderId)

    // 5. Update table if it's a dine-in order (POS context)
    if (originalOrder.table_number) {
        // Table now technically has multiple pending orders. 
        // We'll leave the active_order_id null or point to the first split part.
        // For POS logic, usually the table stays occupied but the specific selection is cleared.
        await supabase.from("pos_tables")
            .update({ active_order_id: null })
            .eq("number", originalOrder.table_number)
    }

    revalidatePath("/pos")
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error: any) {
    console.error("[POS] Split Error:", error)
    return { success: false, error: error.message }
  }
}

export async function getPrinters() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("pos_printers")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error
    return { success: true, printers: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function savePrinter(printer: any) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("pos_printers")
      .upsert({
        ...printer,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath("/admin/settings/pos")
    return { success: true, printer: data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deletePrinter(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("pos_printers")
      .delete()
      .eq("id", id)

    if (error) throw error
    revalidatePath("/admin/settings/pos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
