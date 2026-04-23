import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { POSClient } from "@/components/pos/pos-client"

export default async function POSPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Allowed roles for POS - STRICTLY exclude riders and generic customers
  const allowedRoles = ['admin', 'accountant', 'cashier', 'waiter', 'barman', 'supervisor', 'manager'];
  const userRole = profile?.role || '';
  
  if (
    (!profile?.is_admin && !profile?.is_accountant && !allowedRoles.includes(userRole)) ||
    userRole === 'rider' ||
    userRole === 'customer' ||
    userRole === 'user'
  ) {
    redirect("/dashboard")
  }

  // Fetch categories, menu items, and tables
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("name");
  const { data: menuItems } = await supabase.from("products").select("id, name, price, image_url, category_id, is_active").eq("is_active", true);
  const { data: tables } = await supabase.from("pos_tables").select("*").order("number");

  // Fetch Modifiers
  const { data: modifierGroups } = await supabase
    .from("modifier_groups")
    .select(`
      *,
      modifiers (*)
    `);

  const { data: productModifiers } = await supabase
    .from("product_modifier_groups")
    .select("*");

  return (
    <div className="admin-theme">
      <POSClient 
        categories={categories || []} 
        menuItems={menuItems || []} 
        tables={tables || []}
        userProfile={profile}
        modifierGroups={modifierGroups || []}
        productModifiers={productModifiers || []}
      />
    </div>
  )
}
