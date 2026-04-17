import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "user" | "admin" | "chef" | "rider"
  requireAdmin?: boolean
}

export async function ProtectedRoute({ children, requiredRole, requireAdmin }: ProtectedRouteProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check role if required
  if (requiredRole || requireAdmin) {
    const { data: profile } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single()

    if (requireAdmin && !profile?.is_admin && profile?.role !== "admin") {
      redirect("/dashboard")
    }

    if (requiredRole && profile?.role !== requiredRole && !profile?.is_admin && profile?.role !== "admin") {
      redirect("/dashboard")
    }
  }

  return <>{children}</>
}
