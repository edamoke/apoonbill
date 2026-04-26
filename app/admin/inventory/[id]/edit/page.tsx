import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getInventoryItemDetail } from "@/app/actions/supplier-actions"
import { updateInventoryItem } from "@/app/actions/inventory-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default async function EditInventoryItemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/sign-in")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (!profile.is_admin && profile.role !== 'admin' && profile.role !== 'accountant')) {
    redirect("/admin")
  }

  const resolvedParams = await params
  const { item } = await getInventoryItemDetail(resolvedParams.id)

  if (!item) {
    notFound()
  }

  async function handleUpdate(formData: FormData) {
    "use server"
    const result = await updateInventoryItem(resolvedParams.id, formData)
    if (result.success) {
      redirect(`/admin/inventory/${resolvedParams.id}`)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/inventory/${resolvedParams.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-serif font-bold italic">Edit Inventory Item</h1>
          <p className="text-muted-foreground">Update the details for {item.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" name="name" defaultValue={item.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code</Label>
                  <Input id="sku" name="sku" defaultValue={item.sku} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={item.category} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit (e.g., kg, liters, pcs)</Label>
                  <Input id="unit" name="unit" defaultValue={item.unit} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_cost">Unit Cost (KSh)</Label>
                  <Input id="unit_cost" name="unit_cost" type="number" step="0.01" defaultValue={item.unit_cost} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input id="current_stock" name="current_stock" type="number" step="0.01" defaultValue={item.current_stock} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder_level">Reorder Level</Label>
                  <Input id="reorder_level" name="reorder_level" type="number" step="0.01" defaultValue={item.reorder_level} required />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button asChild variant="outline">
                  <Link href={`/admin/inventory/${resolvedParams.id}`}>Cancel</Link>
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
