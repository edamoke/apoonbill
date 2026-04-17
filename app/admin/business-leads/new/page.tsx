"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  createBusinessLead, 
  BusinessLead, 
  BusinessLeadItem 
} from "@/app/actions/business-leads"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

export default function NewBusinessLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [lead, setLead] = useState<Partial<BusinessLead>>({
    client_name: "",
    client_email: "",
    client_phone: "",
    event_date: "",
    event_location: "",
    notes: "",
    is_linked_to_system: false,
    lead_status: "pending"
  })

  const [items, setItems] = useState<Partial<BusinessLeadItem>[]>([
    { description: "", quantity: 1, unit_price: 0, total_price: 0 }
  ])

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total_price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof BusinessLeadItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === "quantity" || field === "unit_price") {
      const q = field === "quantity" ? Number(value) : Number(newItems[index].quantity)
      const p = field === "unit_price" ? Number(value) : Number(newItems[index].unit_price)
      newItems[index].total_price = q * p
    }
    
    setItems(newItems)
  }

  const totalAmount = items.reduce((acc, curr) => acc + (curr.total_price || 0), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lead.client_name) {
      toast({ title: "Error", description: "Client name is required.", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      await createBusinessLead({ ...lead, total_amount: totalAmount }, items)
      toast({ title: "Success", description: "Business lead created successfully." })
      router.push("/admin/business-leads")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to create lead.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/business-leads">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold italic">New Business Lead</h1>
          <p className="text-muted-foreground">Create a new tracking record for an event or catering request.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the primary contact details for this lead.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input 
                    id="client_name" 
                    placeholder="Full Name / Company" 
                    value={lead.client_name}
                    onChange={(e) => setLead({ ...lead, client_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input 
                    id="client_email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={lead.client_email || ""}
                    onChange={(e) => setLead({ ...lead, client_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Client Phone</Label>
                  <Input 
                    id="client_phone" 
                    placeholder="+254..." 
                    value={lead.client_phone || ""}
                    onChange={(e) => setLead({ ...lead, client_phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input 
                    id="event_date" 
                    type="date" 
                    value={lead.event_date || ""}
                    onChange={(e) => setLead({ ...lead, event_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_location">Event Location</Label>
                <Input 
                  id="event_location" 
                  placeholder="Venue address / coordinates" 
                  value={lead.event_location || ""}
                  onChange={(e) => setLead({ ...lead, event_location: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Link to System</Label>
                  <p className="text-xs text-muted-foreground">Link this lead to core orders & accounting.</p>
                </div>
                <Switch 
                  checked={lead.is_linked_to_system}
                  onCheckedChange={(checked) => setLead({ ...lead, is_linked_to_system: checked })}
                />
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-xs uppercase text-muted-foreground">Notes & Internal Memo</Label>
                <Textarea 
                  placeholder="Internal notes about this lead..." 
                  className="mt-2 h-32"
                  value={lead.notes || ""}
                  onChange={(e) => setLead({ ...lead, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Define the products or services for this business lead.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 space-y-2 w-full">
                    <Label className="text-[10px] uppercase font-bold">Description</Label>
                    <Input 
                      placeholder="Item or service description" 
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-full md:w-24 space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Qty</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Unit Price</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-2">
                    <Label className="text-[10px] uppercase font-bold">Total</Label>
                    <Input 
                      type="number" 
                      readOnly 
                      value={item.total_price}
                      className="bg-muted font-bold"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 mb-[2px]"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t flex flex-col items-end">
              <div className="text-sm text-muted-foreground uppercase font-black">Grand Total</div>
              <div className="text-4xl font-serif font-bold italic text-primary">KSh {totalAmount.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={loading}>
            <Link href="/admin/business-leads">Cancel</Link>
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px]" disabled={loading}>
            {loading ? "Saving..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Business Lead
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
