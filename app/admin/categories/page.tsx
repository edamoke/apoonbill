import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAllowed = 
    profile?.is_admin || 
    profile?.role === 'admin' || 
    profile?.is_accountant || 
    profile?.role === 'accountant'

  if (!isAllowed) {
    redirect("/dashboard")
  }

  // Get categories with product count
  const { data: categories } = await supabase.from("categories").select("*, products(count)").order("name")

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif mb-2">Category Management</h1>
            <p className="text-muted-foreground">Organize your products into categories</p>
          </div>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id} className="border-border">
                {category.image_url && (
                  <div className="aspect-video bg-secondary overflow-hidden">
                    <img
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category.products?.[0]?.count || 0} products</span>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border col-span-full">
              <CardContent className="pt-6 text-center text-muted-foreground">No categories found</CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
