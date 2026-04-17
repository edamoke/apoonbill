"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getSiteSettings(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("content")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching site setting ${id}:`, error)
    return null
  }

  return data.content
}

export async function getAllSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")

  if (error) {
    console.error("Error fetching all site settings:", error)
    return []
  }

  return data
}

export async function getActiveTheme() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("theme_id")
    .eq("id", "styles")
    .single()

  if (error) {
    console.error("Error fetching active theme:", error)
    return "default"
  }

  return data.theme_id || "default"
}

export async function updateTheme(themeId: string) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin && profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin only")
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ theme_id: themeId })
    .eq("id", "styles")

  if (error) {
    console.error(`Error updating theme to ${themeId}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function updateSiteSetting(id: string, content: any) {
  const supabase = await createClient()
  
  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin && profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin only")
  }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ 
      id,
      content,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })

  if (error) {
    console.error(`Error updating site setting ${id}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
