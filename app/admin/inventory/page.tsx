import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InventoryClient from "@/components/admin/inventory-client"

export default async function InventoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.is_suspended) {
    redirect("/auth/login?error=account_suspended")
  }

  const isAllowed = profile?.is_admin || 
                    profile?.role === 'admin' || 
                    profile?.is_accountant || 
                    profile?.role === 'accountant' ||
                    profile?.role === 'hrm'

  if (!isAllowed) {
    redirect("/admin")
  }

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true })

  return <InventoryClient user={user} profile={profile} initialInventoryItems={inventoryItems || []} />
}
