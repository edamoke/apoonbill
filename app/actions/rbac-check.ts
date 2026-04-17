
"use server"

import { createClient } from "@/lib/supabase/server"

export async function hasPermission(moduleSlug: string, action: 'view' | 'edit' | 'delete' = 'view') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role, custom_role_id, is_accountant")
    .eq("id", user.id)
    .single()

  if (!profile) return false

  // Hardcoded Admin Bypass
  if (profile.is_admin || profile.role === 'admin') return true

  // If no custom role assigned, fallback to existing hardcoded logic for compatibility
  if (!profile.custom_role_id) {
    if (profile.role === 'accountant' || profile.is_accountant) {
        const accountantModules = ['accounting', 'hrm', 'pos_settings', 'inventory']
        return accountantModules.includes(moduleSlug)
    }
    return false
  }

  // Dynamic check against role_permissions
  const { data: permission } = await supabase
    .from("role_permissions")
    .select(`
      can_view, 
      can_edit, 
      can_delete,
      app_modules!inner(slug)
    `)
    .eq("role_id", profile.custom_role_id)
    .eq("app_modules.slug", moduleSlug)
    .single()

  if (!permission) return false

  if (action === 'view') return permission.can_view
  if (action === 'edit') return permission.can_edit
  if (action === 'delete') return permission.can_delete

  return false
}
