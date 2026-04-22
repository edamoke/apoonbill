import { createClient } from "@/lib/supabase/server"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ProductCard } from "@/components/product/product-card"
import { SiteFooter } from "@/components/home-sections/home-sections"
import { getAllSiteSettings } from "@/app/actions/cms-actions"

export default async function ChickenPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from("profiles").select("id, full_name, role, email_confirmed").eq("id", user.id).single()
    : { data: null }

  // Fetch chicken items
  const { data: chickenItems } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or("slug.ilike.%chicken%,name.ilike.%chicken%")
    .order("name")

  const settings = await getAllSiteSettings()
  const getSetting = (id: string) => settings.find(s => s.id === id)?.content || null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderWrapper user={user} profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">Chicken</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From crispy fried to tender grilled, discover our delicious range of chicken dishes.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {chickenItems?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {(!chickenItems || chickenItems.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground italic text-lg">Delicious chicken dishes are on their way!</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter content={getSetting("footer")} />
    </div>
  )
}
