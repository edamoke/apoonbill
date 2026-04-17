"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCategory(id: string, updates: {
  name?: string
  description?: string
  image_url?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin && profile?.role !== "admin") {
    throw new Error("Forbidden")
  }

  const dataToUpdate: any = { ...updates }
  if (updates.name) {
    dataToUpdate.slug = updates.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
  }

  const { error } = await supabase
    .from("categories")
    .update(dataToUpdate)
    .eq("id", id)

  if (error) {
    console.error("Error updating category:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/categories")
  revalidatePath("/menu")
  return { success: true }
}

export async function createCategory(data: {
  name: string
  description?: string
  image_url?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin && profile?.role !== "admin") {
    throw new Error("Forbidden")
  }

  const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
  const { error } = await supabase
    .from("categories")
    .insert([{ ...data, slug }])

  if (error) {
    console.error("Error creating category:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/categories")
  revalidatePath("/menu")
  return { success: true }
}

export async function getCategories() {
  const { createAdminClient } = await import("@/lib/supabase/server")
  const supabase = await createAdminClient()
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return { success: false, error: error.message }
  }

  return { success: true, categories: data }
}
