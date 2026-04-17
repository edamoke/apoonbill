"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createCaptainOrder } from "@/app/actions/captain-actions"

export function CaptainOrderForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const tableNumber = formData.get("table_number") as string
    const notes = formData.get("notes") as string
    
    const result = await createCaptainOrder(tableNumber, notes)
    setLoading(false)

    if (result.success) {
      toast({ title: "Success", description: "Captain order created for table " + tableNumber })
      router.refresh()
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Captain Order</CardTitle>
        <CardDescription>Open a new order for a table on the floor.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table_number">Table Number</Label>
            <Input id="table_number" name="table_number" placeholder="e.g. Table 5" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea id="notes" name="notes" placeholder="Any special requests?" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
