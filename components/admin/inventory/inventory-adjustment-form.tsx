"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Minus, Loader2 } from "lucide-react"

interface InventoryAdjustmentFormProps {
  itemId: string
  unit: string
}

export function InventoryAdjustmentForm({ itemId, unit }: InventoryAdjustmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"addition" | "subtraction">("addition")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const qty = parseFloat(quantity)
      if (isNaN(qty) || qty <= 0) throw new Error("Invalid quantity")

      // 1. Create adjustment record
      const { error: adjError } = await supabase
        .from("inventory_adjustments")
        .insert({
          inventory_item_id: itemId,
          adjustment_type: type,
          quantity: qty,
          reason: reason,
          created_by: user.id
        })

      if (adjError) throw adjError

      // 2. Update item quantity (The trigger might handle this, but let's be explicit if not)
      // Actually, usually a DB trigger handles inventory item updates from adjustments.
      
      toast({
        title: "Stock Adjusted",
        description: `Successfully ${type === 'addition' ? 'added' : 'removed'} ${qty} ${unit}`
      })
      
      setQuantity("")
      setReason("")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Adjustment Type</Label>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant={type === 'addition' ? 'default' : 'outline'}
            className="flex-1 gap-2"
            onClick={() => setType('addition')}
          >
            <Plus className="h-4 w-4" /> Addition
          </Button>
          <Button 
            type="button"
            variant={type === 'subtraction' ? 'destructive' : 'outline'}
            className="flex-1 gap-2"
            onClick={() => setType('subtraction')}
          >
            <Minus className="h-4 w-4" /> Subtraction
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity ({unit})</Label>
        <Input 
          id="quantity"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Adjustment</Label>
        <Textarea 
          id="reason"
          placeholder="e.g. Stock received, Spillage, Periodic count..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Apply Adjustment
      </Button>
    </form>
  )
}
