import { createClient } from "@/lib/supabase/server"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ProductCard } from "@/components/product/product-card"
import { redirect } from "next/navigation"

export default async function WishlistPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get wishlist items
  const { data: wishlistItems } = await supabase
    .from("wishlists")
    .select("*, products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground">Foods you've loved and saved for later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlistItems && wishlistItems.length > 0 ? (
          wishlistItems.map((item: any) => (
            <ProductCard key={item.id} product={item.products} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
            <p className="text-xl text-muted-foreground font-serif italic mb-4">Your wishlist is empty.</p>
            <p className="text-sm text-muted-foreground mb-8">Start exploring our menu and love some food!</p>
          </div>
        )}
      </div>
    </div>
  )
}
