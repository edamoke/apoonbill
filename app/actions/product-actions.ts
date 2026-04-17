"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function clearAndLoadNewMenu(categories: any[], products: any[]) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, role")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin && profile?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    const { error: deleteProductsError } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (deleteProductsError) throw new Error(`Error deleting products: ${deleteProductsError.message}`)

    const { error: deleteCategoriesError } = await supabase
      .from("categories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (deleteCategoriesError) throw new Error(`Error deleting categories: ${deleteCategoriesError.message}`)

    if (categories.length > 0) {
      const { error: insertCatsError } = await supabase
        .from("categories")
        .insert(categories)

      if (insertCatsError) throw new Error(`Error inserting categories: ${insertCatsError.message}`)
    }

    if (products.length > 0) {
      // Ensure each product has is_active set to true so they appear in the UI
      const productsToInsert = products.map(p => ({
        ...p,
        is_active: p.is_active !== undefined ? p.is_active : true
      }))

      const { error: insertProductsError } = await supabase
        .from("products")
        .insert(productsToInsert)

      if (insertProductsError) throw new Error(`Error inserting products: ${insertProductsError.message}`)
    }

    revalidatePath("/admin/products")
    revalidatePath("/menu")
    return { success: true }

  } catch (error: any) {
    console.error("Menu migration error:", error)
    return { success: false, error: error.message }
  }
}
