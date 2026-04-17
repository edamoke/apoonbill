import { RecipeManager } from "@/components/admin/recipe-manager"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed } from "lucide-react"

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profiles to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || (!profile.is_admin && profile.role !== "admin" && !profile.is_accountant && profile.role !== "accountant")) {
    redirect("/")
  }

  // Fetch menu items and inventory items
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, name")
    .order("name")

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, name, unit")
    .order("name")

  // Fetch all recipes to show a list or for initial state
  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recipe Management</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>
              Select a menu item to manage its recipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <RecipeManager 
                    menuItemId={item.id}
                    menuItemName={item.name}
                    inventoryItems={inventoryItems || []}
                    existingRecipe={recipes?.filter(r => r.menu_item_id === item.id) || []}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Inventory Quick View</CardTitle>
            <CardDescription>
              Available items for recipes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
               {inventoryItems?.map(item => (
                 <div key={item.id} className="text-sm flex justify-between">
                   <span>{item.name}</span>
                   <span className="text-muted-foreground">{item.unit}</span>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
