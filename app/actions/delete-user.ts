"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  
  // 1. Verify the current user is an admin
  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
  if (userError || !currentUser) {
    return { success: false, error: "Authentication required" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", currentUser.id)
    .single()

  const isAdmin = profile?.is_admin || profile?.role === 'admin'
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin access required" }
  }

  // 2. Prevent self-deletion
  if (currentUser.id === userId) {
    return { success: false, error: "You cannot delete your own account" }
  }

  const adminSupabase = await createAdminClient()

  try {
    // 3. Delete from auth.users (this will cascade to profiles if foreign keys are set up, 
    // but we'll also delete from profiles explicitly to be sure and handle any RLS/trigger issues)
    
    // Deleting from profiles first to handle dependencies if any
    const { error: profileDeleteError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileDeleteError) {
      console.error("Profile deletion error:", profileDeleteError)
      // We continue because the user might not have a profile but still exists in auth
    }

    const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error("Auth deletion error:", authDeleteError)
      return { success: false, error: `Failed to delete user from auth: ${authDeleteError.message}` }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Exception deleting user:", error)
    return {
      success: false,
      error: `Exception occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
