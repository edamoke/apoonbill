"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  getBusinessLead,
  updateBusinessLead, 
  BusinessLead, 
  BusinessLeadItem 
} from "@/app/actions/business-leads"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

export default function EditBusinessLeadPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [lead, setLead] = useState<Partial<BusinessLead>>({})
  const [items, setItems] = useState<Partial<BusinessLeadItem>[]>([])

  useEffect(() => {
    if (id) fetchLead()
  }, [id])

  async function fetchLead() {
    try {
      setLoading(true)
      const data = await getBusinessLead(id as string)
      const { items: leadItems, ...leadData } = data
      setLead(leadData)
      setItems(leadItems)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load lead details.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

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
      setSaving(true)
      await updateBusinessLead(id as string, { ...lead, total_amount: totalAmount }, items)
      toast({ title: "Success", description: "Business lead updated successfully." })
      router.push(`/admin/business-leads/${id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to update lead.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-center italic">Loading lead details...</div>

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/business-leads/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold italic">Edit {lead.document_number}</h1>
          <p className="text-muted-foreground uppercase text-xs font-black">Updating record for {lead.client_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input 
                    id="client_name" 
                    value={lead.client_name || ""}
                    onChange={(e) => setLead({ ...lead, client_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email</Label>
                  <Input 
                    id="client_email" 
                    type="email" 
                    value={lead.client_email || ""}
                    onChange={(e) => setLead({ ...lead, client_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Client Phone</Label>
                  <Input 
                    id="client_phone" 
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
                  value={lead.event_location || ""}
                  onChange={(e) => setLead({ ...lead, event_location: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label>Link to System</Label>
                  <p className="text-xs text-muted-foreground">Status: {lead.is_linked_to_system ? "Linked" : "Standalone"}</p>
                </div>
                <Switch 
                  checked={lead.is_linked_to_system}
                  onCheckedChange={(checked) => setLead({ ...lead, is_linked_to_system: checked })}
                />
              </div>
              
              <div className="pt-4 border-t text-sm font-bold uppercase text-muted-foreground">
                Current Status: {lead.lead_status}
              </div>

              <div className="pt-4 border-t">
                <Label className="text-xs uppercase text-muted-foreground">Internal Memo</Label>
                <Textarea 
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
            <CardTitle>Line Items</CardTitle>
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
          <Button type="button" variant="outline" asChild disabled={saving}>
            <Link href={`/admin/business-leads/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 min-w-[150px]" disabled={saving}>
            {saving ? "Saving..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Lead
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
