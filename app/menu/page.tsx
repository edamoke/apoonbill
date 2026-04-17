import { createClient } from "@/lib/supabase/server"
import MenuClient from "@/components/product/menu-client"
import { getAllSiteSettings } from "@/app/actions/cms-actions"

export default async function MenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Fetch all active categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Fetch active products with their categories
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("is_active", true)
    .order("name")

  const settings = await getAllSiteSettings()
  const footerContent = settings.find(s => s.id === "footer")?.content || null

  return (
    <MenuClient 
      user={user} 
      profile={profile} 
      categories={categories || []} 
      products={products || []} 
      footerContent={footerContent}
    />
  )
}
