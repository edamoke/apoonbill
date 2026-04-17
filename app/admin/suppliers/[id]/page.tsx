import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Mail, Phone, MapPin, Package, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function SupplierItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single()

  if (!supplier) notFound()

  // Fetch linked inventory items
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("supplier_id", id)

  // Fetch recent supply orders
  const { data: orders } = await supabase
    .from("supplier_orders")
    .select("*")
    .eq("supplier_id", id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">Supplier Code: {supplier.contact_person || 'N/A'}</p>
          </div>
        </div>
        <Badge className="px-4 py-1 text-sm">Active Partner</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                 <Mail className="h-4 w-4 text-muted-foreground" />
                 <span>{supplier.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                 <Phone className="h-4 w-4 text-muted-foreground" />
                 <span>{supplier.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                 <MapPin className="h-4 w-4 text-muted-foreground" />
                 <span>{supplier.address || 'No address provided'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supplied Items</CardTitle>
              <CardDescription>Inventory linked to this supplier</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                 {inventoryItems?.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary/60" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{item.quantity} {item.unit}</Badge>
                   </div>
                 ))}
                 {(!inventoryItems || inventoryItems.length === 0) && (
                   <p className="p-4 text-xs text-muted-foreground italic text-center">No inventory items linked.</p>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Supply Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'received' ? 'default' :
                          order.status === 'pending' ? 'outline' : 'secondary'
                        } className="text-[10px] capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic">No supply orders found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
