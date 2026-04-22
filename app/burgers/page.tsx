import { createClient } from "@/lib/supabase/server"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ProductCard } from "@/components/product/product-card"
import { SiteFooter } from "@/components/home-sections/home-sections"
import { getAllSiteSettings } from "@/app/actions/cms-actions"

export default async function BurgersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from("profiles").select("id, full_name, role, email_confirmed").eq("id", user.id).single()
    : { data: null }

  // Fetch burgers
  const { data: burgers } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or("slug.ilike.%burger%,name.ilike.%burger%")
    .order("name")

  const settings = await getAllSiteSettings()
  const getSetting = (id: string) => settings.find(s => s.id === id)?.content || null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderWrapper user={user} profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Burgers</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Juicy, flame-grilled burgers made with the finest ingredients and our signature sauces.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {burgers?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {(!burgers || burgers.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground italic text-lg">Our burger selection is currently being crafted. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter content={getSetting("footer")} />
    </div>
  )
}
