import { createClient } from "@/lib/supabase/server"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Star } from "lucide-react"
import { AddToCartButton } from "@/components/product/add-to-cart-button"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Get product
  const { data: product } = await supabase.from("products").select("*, categories(name)").eq("slug", slug).single()

  if (!product) {
    notFound()
  }

  // Get ratings
  const { data: ratings } = await supabase
    .from("product_ratings")
    .select("rating, review, profiles(full_name)")
    .eq("product_id", product.id)

  const avgRating = ratings?.length ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length : 0

  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderWrapper user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/menu">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-serif text-muted-foreground">{product.name[0]}</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square bg-secondary rounded overflow-hidden">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif mb-2">{product.name}</h1>
              {product.categories && (
                <p className="text-muted-foreground">
                  <Link href={`/menu?category=${product.categories.slug}`} className="hover:text-primary">
                    {product.categories.name}
                  </Link>
                </p>
              )}
            </div>

            {avgRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({ratings?.length} reviews)
                </span>
              </div>
            )}

            <div className="text-4xl font-serif text-primary">Ksh {product.price}</div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Product Details */}
            <div className="flex flex-wrap gap-2">
              {product.is_vegetarian && <Badge variant="secondary">Vegetarian</Badge>}
              {product.is_vegan && <Badge variant="secondary">Vegan</Badge>}
              {product.spice_level > 0 && <Badge variant="destructive">Spicy {"🌶️".repeat(product.spice_level)}</Badge>}
              {product.calories && <Badge variant="outline">{product.calories} cal</Badge>}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{product.preparation_time} mins prep</span>
              </div>
              <div>
                <span>Portion: {product.portion_size}</span>
              </div>
            </div>

            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <Card className="border-border">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Ingredients</h3>
                  <p className="text-sm text-muted-foreground">{product.ingredients.join(", ")}</p>
                </CardContent>
              </Card>
            )}

            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <Card className="border-border border-destructive/50">
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2 text-destructive">Allergen Information</h3>
                  <p className="text-sm text-muted-foreground">Contains: {product.allergens.join(", ")}</p>
                </CardContent>
              </Card>
            )}

            {/* Add to Cart */}
            <AddToCartButton product={product} />
          </div>
        </div>

        {/* Reviews */}
        {ratings && ratings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-serif mb-8">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ratings.map((rating: any, idx: number) => (
                <Card key={idx} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{rating.profiles?.full_name || "Anonymous"}</span>
                    </div>
                    {rating.review && <p className="text-sm text-muted-foreground">{rating.review}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
