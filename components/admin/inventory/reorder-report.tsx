"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  ShoppingCart, 
  CheckCircle2, 
  RefreshCcw,
  Truck,
  Mail,
  Phone
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function ReorderReport() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchReport()
  }, [])

  async function fetchReport() {
    setLoading(true)
    const { data, error } = await supabase.from("daily_reorder_report").select("*")
    if (error) {
      toast({ title: "Error", description: "Failed to load reorder report.", variant: "destructive" })
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  async function handleCreateOrder(item: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: orderId, error } = await supabase.rpc("create_supply_order_from_item", {
        p_inventory_item_id: item.inventory_item_id,
        p_quantity: Math.max(0, item.suggested_order_quantity),
        p_unit_cost: 0, // Should be pulled from item if possible, for now 0 to be edited in order
        p_supplier_id: item.supplier_id,
        p_user_id: user.id
      })

      if (error) throw error

      toast({ 
        title: "Order Created", 
        description: `Supply order for ${item.item_name} has been generated.` 
      })
      
      fetchReport()
      router.push(`/admin/supply-chain/orders/${orderId}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  if (loading) return <div className="flex items-center justify-center p-12"><RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <Card className="border-red-500/20 shadow-lg">
        <CardHeader className="bg-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-lg text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase">Low Stock Reorder Report</CardTitle>
                <CardDescription className="font-bold">Items requiring urgent attention based on reorder levels.</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 h-10 border-red-500 text-red-500 font-black">
              {items.length} ITEMS AT RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold uppercase text-[10px]">Item Details</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Current Stock</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Reorder Level</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Preferred Supplier</TableHead>
                <TableHead className="font-bold uppercase text-[10px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <p className="font-bold">All stock levels are healthy.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.inventory_item_id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase">{item.item_name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{item.category} | SKU: {item.sku || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.current_stock <= (item.reorder_level * 0.5) ? "destructive" : "outline"} className="font-black">
                        {item.current_stock} {item.unit}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-muted-foreground">
                      {item.reorder_level} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.supplier_name ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold flex items-center gap-1"><Truck className="h-3 w-3" /> {item.supplier_name}</span>
                          <div className="flex gap-2">
                             {item.supplier_email && <Mail className="h-3 w-3 text-muted-foreground" />}
                             {item.supplier_phone && <Phone className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-yellow-600 font-bold bg-yellow-500/10 px-2 py-1 rounded">No Supplier Assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        className="font-bold gap-2" 
                        disabled={!item.supplier_id}
                        onClick={() => handleCreateOrder(item)}
                      >
                        <ShoppingCart className="h-4 w-4" /> REORDER {Math.ceil(item.suggested_order_quantity)}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
