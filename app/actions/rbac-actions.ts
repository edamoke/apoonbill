
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getRoles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("custom_roles")
    .select("*, role_permissions(*, app_modules(*))")
    .order("created_at", { ascending: true })
  
  if (error) throw error
  return data
}

export async function getModules() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("app_modules")
    .select("*")
    .order("slug", { ascending: true })
  
  if (error) throw error
  return data
}

export async function createRole(name: string, description: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("custom_roles")
    .insert({ name, description })
    .select()
    .single()
  
  if (error) throw error
  revalidatePath("/admin/settings/access-control")
  return data
}

export async function updatePermission(roleId: string, moduleId: string, updates: { can_view?: boolean, can_edit?: boolean, can_delete?: boolean }) {
  const supabase = await createClient()
  
  const { data: existing } = await supabase
    .from("role_permissions")
    .select("id")
    .eq("role_id", roleId)
    .eq("module_id", moduleId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("role_permissions")
      .update(updates)
      .eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from("role_permissions")
      .insert({
        role_id: roleId,
        module_id: moduleId,
        can_view: updates.can_view ?? false,
        can_edit: updates.can_edit ?? false,
        can_delete: updates.can_delete ?? false
      })
    if (error) throw error
  }

  revalidatePath("/admin/settings/access-control")
}

export async function assignRoleToUser(userId: string, roleId: string | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ custom_role_id: roleId })
    .eq("id", userId)
  
  if (error) throw error
  revalidatePath("/admin/users")
}
