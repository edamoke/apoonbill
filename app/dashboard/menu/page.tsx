import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/product/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardMenuPage() {
  const supabase = await createClient()

  // Fetch products from database
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name")

  // Categorize products
  const categorizedProducts = {
    breakfast: products?.filter(p => 
      p.slug.includes('breakfast') || 
      p.slug.includes('crepes')
    ) || [],
    'main-meals': products?.filter(p => 
      p.slug.includes('steak') || 
      p.slug.includes('grill') || 
      p.slug.includes('lentil') || 
      p.slug.includes('potatoes-bacon') || 
      p.slug.includes('rice') || 
      p.slug.includes('tilapia') || 
      p.slug.includes('chicken') || 
      p.slug.includes('fish') || 
      p.slug.includes('ugali') || 
      p.slug.includes('legumes')
    ) || [],
    drinks: products?.filter(p => 
      p.slug.includes('drink') || 
      p.slug.includes('beverage') || 
      p.slug.includes('juice') || 
      p.slug.includes('tea') || 
      p.slug.includes('coffee')
    ) || [],
    desserts: products?.filter(p => 
      p.slug.includes('sweet-potato') || 
      p.slug.includes('dessert') || 
      p.slug.includes('chocolate')
    ) || []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-serif font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground leading-relaxed">
          Order your favorite meals directly from your dashboard.
        </p>
      </div>

      <Tabs defaultValue="main-meals" className="w-full">
        <div className="flex justify-center md:justify-start mb-8">
          <TabsList className="bg-muted p-1 h-auto rounded-full border shadow-sm overflow-x-auto flex-nowrap max-w-full">
            <TabsTrigger value="breakfast" className="rounded-full px-6 py-2">Breakfast</TabsTrigger>
            <TabsTrigger value="main-meals" className="rounded-full px-6 py-2">Main Meals</TabsTrigger>
            <TabsTrigger value="drinks" className="rounded-full px-6 py-2">Drinks</TabsTrigger>
            <TabsTrigger value="desserts" className="rounded-full px-6 py-2">Desserts</TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(categorizedProducts).map(([category, items]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-center py-20 bg-secondary/10 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground font-serif italic">Items are being prepared...</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
