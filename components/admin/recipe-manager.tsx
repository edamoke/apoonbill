"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { saveRecipe } from "@/app/actions/inventory-actions"
import { Trash2, Plus, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface RecipeManagerProps {
  menuItemId: string
  menuItemName: string
  inventoryItems: any[]
  existingRecipe: any[]
}

export function RecipeManager({ menuItemId, menuItemName, inventoryItems, existingRecipe }: RecipeManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [ingredients, setIngredients] = useState<any[]>(existingRecipe || [])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const addIngredient = () => {
    setIngredients([...ingredients, { inventory_item_id: "", quantity_required: 0 }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  const handleSave = async () => {
    setLoading(true)
    const result = await saveRecipe(menuItemId, ingredients)
    setLoading(false)

    if (result.success) {
      toast({ title: "Success", description: "Recipe saved successfully." })
      setIsOpen(false)
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          {ingredients.length > 0 ? "Edit Recipe" : "Add Recipe"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recipe for {menuItemName}</DialogTitle>
          <DialogDescription>Define which inventory items are consumed when this dish is sold.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {ingredients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No ingredients added yet.
            </div>
          )}
          {ingredients.map((ing, index) => (
            <div key={index} className="flex gap-4 items-end border-b pb-4">
              <div className="flex-1 space-y-2">
                <Label>Inventory Item</Label>
                <Select 
                  value={ing.inventory_item_id} 
                  onValueChange={(val) => updateIngredient(index, "inventory_item_id", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-2">
                <Label>Qty Required</Label>
                <Input 
                  type="number" 
                  step="0.001" 
                  value={ing.quantity_required} 
                  onChange={(e) => updateIngredient(index, "quantity_required", parseFloat(e.target.value))}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={addIngredient}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
