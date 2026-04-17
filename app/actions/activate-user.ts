"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"

export async function activateUser(userId: string) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // 1. Update the profiles table
  const { data: profileData, error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      email_confirmed: true,
    })
    .eq("id", userId)
    .select()

  if (profileError) {
    console.error("Profile update error:", profileError)
    return { success: false, error: profileError.message }
  }

  if (!profileData || profileData.length === 0) {
    return { success: false, error: "User not found in profiles table" }
  }

  try {
    // 2. Update the auth metadata using admin client
    const { data: authData, error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth update error:", authError)
      return { success: false, error: `Profile updated but auth failed: ${authError.message}` }
    }

    return { success: true, data: profileData[0] }
  } catch (error) {
    console.error("Exception updating auth:", error)
    return {
      success: false,
      error: `Profile updated but auth failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
