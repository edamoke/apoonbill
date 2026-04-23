"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Tag, 
  Clock, 
} from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export default function DiscountManagementPage() {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Form State
  const [selectionMode, setSelectionMode] = useState<'individual' | 'category'>('individual')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [percentage, setPercentage] = useState("10")
  const [endDate, setEndDate] = useState("")

  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
      fetchData()
    }
    init()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [discountRes, itemsRes, catRes] = await Promise.all([
      supabase.from("product_discounts").select("*, menu_items(name, price)").order("created_at", { ascending: false }),
      supabase.from("menu_items").select("id, name, price, category_id").order("name"),
      supabase.from("menu_categories").select("id, name")
    ])
    setDiscounts(discountRes.data || [])
    setMenuItems(itemsRes.data || [])
    setCategories(catRes.data || [])
    setLoading(false)
  }

  async function handleAddDiscount() {
    let targetIds: string[] = []

    if (selectionMode === 'individual') {
      targetIds = selectedItems
    } else {
      targetIds = menuItems.filter(i => i.category_id === selectedCategoryId).map(i => i.id)
    }

    if (targetIds.length === 0 || !endDate) {
      toast({ title: "Validation Error", description: "Please select items and an expiry date.", variant: "destructive" })
      return
    }
    
    const discountData = targetIds.map(id => ({
      menu_item_id: id,
      discount_percentage: Number(percentage),
      end_time: new Date(endDate).toISOString(),
      is_active: true
    }))

    const { error } = await supabase.from("product_discounts").upsert(discountData, { onConflict: 'menu_item_id' })

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Bulk Discount Active", description: `${targetIds.length} items updated.` })
      setIsAdding(false)
      setSelectedItems([])
      fetchData()
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("product_discounts").delete().eq("id", id)
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" })
    else {
      toast({ title: "Offer Removed", description: "Discount has been deleted." })
      fetchData()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Global Price Discounts</h1>
            <p className="text-muted-foreground font-medium mt-1 text-sm italic">POS Integrated Bulk Pricing Engine</p>
          </div>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="rounded-full px-8 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100 h-12 font-bold uppercase tracking-widest text-xs">
                <Plus className="mr-2 h-5 w-5" />
                New Bulk Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[32px] p-8 border-none bg-white max-w-2xl overflow-hidden shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Launch Pricing Campaign</DialogTitle>
                <DialogDescription>Apply discounts by category or multi-select items.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                   <Button 
                    type="button"
                    variant="ghost"
                    className={cn("flex-1 rounded-lg text-[10px] font-black uppercase h-10", selectionMode === 'individual' ? "bg-white text-black shadow-sm" : "text-slate-500")}
                    onClick={() => setSelectionMode('individual')}
                   >
                     Individual Select
                   </Button>
                   <Button 
                    type="button"
                    variant="ghost"
                    className={cn("flex-1 rounded-lg text-[10px] font-black uppercase h-10", selectionMode === 'category' ? "bg-white text-black shadow-sm" : "text-slate-500")}
                    onClick={() => setSelectionMode('category')}
                   >
                     Category Bulk
                   </Button>
                </div>

                {selectionMode === 'category' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Category</label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 text-slate-900">
                        <SelectValue placeholder="Pick a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Multiple Items ({selectedItems.length})</label>
                     <div className="grid grid-cols-2 gap-2 border rounded-xl p-4 max-h-48 overflow-y-auto">
                        {menuItems.map(item => (
                          <div key={item.id} className="flex items-center space-x-2 p-1">
                             <Checkbox 
                              id={item.id} 
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedItems([...selectedItems, item.id])
                                else setSelectedItems(selectedItems.filter(id => id !== item.id))
                              }}
                             />
                             <label htmlFor={item.id} className="text-[11px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate text-slate-700">
                               {item.name}
                             </label>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discount Percentage</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={percentage} 
                        onChange={(e) => setPercentage(e.target.value)}
                        className="h-12 rounded-xl border-slate-100 text-slate-900 pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date/Time</label>
                    <Input 
                      type="datetime-local" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-12 rounded-xl border-slate-100 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleAddDiscount} className="rounded-xl bg-red-600 hover:bg-red-700 px-8 text-white font-bold uppercase text-xs tracking-widest">Activate Bulk Pricing</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => {
            const isExpired = new Date(discount.end_time) < new Date()
            const originalPrice = Number(discount.menu_items?.price || 0)
            const discountedPrice = originalPrice * (1 - Number(discount.discount_percentage) / 100)

            return (
              <Card key={discount.id} className="border-none shadow-lg rounded-[28px] overflow-hidden group hover:-translate-y-1 transition-all">
                <div className={cn(
                  "p-6 text-white flex flex-col justify-between h-48 relative overflow-hidden",
                  isExpired ? "bg-slate-400" : "bg-gradient-to-br from-red-500 via-red-600 to-red-800"
                )}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                   
                   <div className="flex justify-between items-start z-10">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                         <Tag className="h-5 w-5" />
                      </div>
                      <Badge className="bg-white/20 text-white border-none font-black text-[9px] uppercase tracking-widest px-2">
                         {isExpired ? "Offer Ended" : "Live at POS"}
                      </Badge>
                   </div>

                   <div className="z-10">
                      <h3 className="font-black text-xl uppercase leading-tight truncate italic">{discount.menu_items?.name}</h3>
                      <div className="flex items-end gap-2">
                         <p className="text-4xl font-black tracking-tighter">-{discount.discount_percentage}%</p>
                         <span className="text-[10px] font-bold uppercase mb-1 opacity-70">Price Drop</span>
                      </div>
                   </div>
                </div>

                <CardContent className="p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">New Price</p>
                         <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-muted-foreground">KES {originalPrice}</span>
                            <span className="text-sm font-black text-red-600">KES {discountedPrice.toFixed(0)}</span>
                         </div>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Auto-Stop</p>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Clock className="h-3 w-3 text-red-500" />
                            {format(new Date(discount.end_time), "MMM d, HH:mm")}
                         </div>
                      </div>
                   </div>

                   <Button 
                    variant="ghost" 
                    className="w-full text-destructive hover:bg-red-50 rounded-xl font-bold uppercase text-[10px] tracking-widest h-10 border border-transparent hover:border-red-100"
                    onClick={() => handleDelete(discount.id)}
                   >
                     <Trash2 className="h-3.5 w-3.5 mr-2" />
                     Delete Schedule
                   </Button>
                </CardContent>
              </Card>
            )
          })}

          {discounts.length === 0 && !loading && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-[40px] border-2 border-dashed">
               <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Tag className="w-8 h-8 opacity-20" />
               </div>
               <p className="font-black uppercase tracking-widest text-sm">No Active Campaigns</p>
               <p className="text-xs font-medium mt-2">Create bulk offers to boost POS sales.</p>
               <Button variant="outline" className="mt-6 rounded-full px-8" onClick={() => setIsAdding(true)}>Configure first offer</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
