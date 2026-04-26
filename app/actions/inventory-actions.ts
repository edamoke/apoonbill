"use server"

import { createClient, validateRole } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addInventoryItem(formData: FormData) {
  try {
    await validateRole(['admin', 'staff', 'chef'])
    const supabase = await createClient()

    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const unit_cost = parseFloat(formData.get("unit_cost") as string) || 0
    const current_stock = parseFloat(formData.get("current_stock") as string) || 0
    const reorder_level = parseFloat(formData.get("reorder_level") as string) || 0
    const category = formData.get("category") as string
    const sku = formData.get("sku") as string

    const { error } = await supabase.from("inventory_items").insert({
      name,
      unit,
      unit_cost,
      current_stock,
      reorder_level,
      category,
      sku,
    })

    if (error) throw error

    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error: any) {
    console.error("Error adding inventory item:", error)
    return { success: false, error: error.message }
  }
}

export async function updateInventoryItem(id: string, formData: FormData) {
  try {
    await validateRole(['admin', 'staff', 'chef'])
    const supabase = await createClient()

    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const unit_cost = parseFloat(formData.get("unit_cost") as string) || 0
    const current_stock = parseFloat(formData.get("current_stock") as string) || 0
    const reorder_level = parseFloat(formData.get("reorder_level") as string) || 0
    const category = formData.get("category") as string
    const sku = formData.get("sku") as string

    const { error } = await supabase
      .from("inventory_items")
      .update({
        name,
        unit,
        unit_cost,
        current_stock,
        reorder_level,
        category,
        sku,
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/inventory")
    revalidatePath(`/admin/inventory/${id}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating inventory item:", error)
    return { success: false, error: error.message }
  }
}

export async function updateInventoryStock(itemId: string, quantity: number, type: string, notes?: string) {
  try {
    const { user } = await validateRole(['admin', 'staff', 'chef'])
    const supabase = await createClient()

    // 1. Get current stock
    const { data: item, error: fetchError } = await supabase
      .from("inventory_items")
      .select("current_stock")
      .eq("id", itemId)
      .single()

    if (fetchError) throw fetchError

    const newStock = (item.current_stock || 0) + quantity

    // 2. Update stock
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({ current_stock: newStock })
      .eq("id", itemId)

    if (updateError) throw updateError

    // 3. Log transaction
    const { error: logError } = await supabase.from("inventory_transactions").insert({
      inventory_item_id: itemId,
      type,
      quantity,
      notes,
      created_by: user.id
    })

    if (logError) throw logError

    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating stock:", error)
    return { success: false, error: error.message }
  }
}

export async function saveRecipe(menuItemId: string, ingredients: { inventory_item_id: string, quantity_required: number }[]) {
  try {
    await validateRole(['admin', 'chef'])
    const supabase = await createClient()
    
    // Delete existing recipe for this menu item
    await supabase.from("recipes").delete().eq("menu_item_id", menuItemId)

    // Insert new recipe components
    if (ingredients.length > 0) {
      const { error } = await supabase.from("recipes").insert(
        ingredients.map(ing => ({
          menu_item_id: menuItemId,
          inventory_item_id: ing.inventory_item_id,
          quantity_required: ing.quantity_required
        }))
      )
      if (error) throw error
    }

    revalidatePath("/admin/products")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving recipe:", error)
    return { success: false, error: error.message }
  }
}

export async function processInventoryUsage(orderId: string) {
  try {
    // Note: Internal system process, usually triggered by another action
    // But we still use createClient to respect RLS or adminClient if needed
    const supabase = await createClient()
    
    // 1. Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId)

    if (itemsError) throw itemsError

    for (const item of orderItems) {
      // 2. Get recipe for each product
      const { data: recipe } = await supabase
        .from("recipes")
        .select("inventory_item_id, quantity_required")
        .eq("menu_item_id", item.product_id)

      if (recipe && recipe.length > 0) {
        for (const ingredient of recipe) {
          const usageQuantity = ingredient.quantity_required * item.quantity
          // 3. Subtract from inventory
          // We use a bypass or direct update here because it's a system process
          // But for safety we call updateInventoryStock which now checks roles
          // In a real scenario, we might need a separate internal function without role checks for automation
          await updateInventoryStock(
            ingredient.inventory_item_id,
            -usageQuantity,
            "usage",
            `Auto-subtraction for order ${orderId}`
          )
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error processing inventory usage:", error)
    return { success: false, error: error.message }
  }
}
