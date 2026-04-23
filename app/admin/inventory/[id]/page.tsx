import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { getInventoryItemDetail } from "@/app/actions/supplier-actions"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Truck, 
  Calendar, 
  History, 
  ArrowLeft,
  Scale,
  DollarSign,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function InventoryItemDetailPage({ params }: { params: { id: string } }) {
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
  const { item, lastUpdate, recentRequests } = await getInventoryItemDetail(resolvedParams.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-tight">{item.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="uppercase">{item.category}</Badge>
                {item.is_prepared_item && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">PREP ITEM</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Button asChild variant="outline">
                <Link href={`/admin/inventory/${item.id}/edit`}>Edit Item</Link>
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Stock Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Stock</p>
                  <p className="text-2xl font-black">{item.current_stock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Reorder Level</p>
                  <p className="text-2xl font-black">{item.reorder_level} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Unit Cost</p>
                  <p className="text-2xl font-black">KSH {item.unit_cost}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Value</p>
                  <p className="text-2xl font-black text-green-600">KSH {(item.current_stock * item.unit_cost).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  Recent Supply Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Qty</th>
                        <th className="px-6 py-3">Cost</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentRequests && recentRequests.length > 0 ? (
                        recentRequests.map((req: any) => (
                          <tr key={req.id} className="text-sm">
                            <td className="px-6 py-4">{format(new Date(req.created_at), 'MMM dd, yyyy')}</td>
                            <td className="px-6 py-4 font-mono text-xs">{req.supply_orders.id.substring(0, 8)}...</td>
                            <td className="px-6 py-4 font-bold">{req.quantity} {item.unit}</td>
                            <td className="px-6 py-4">KSH {req.unit_cost}</td>
                            <td className="px-6 py-4">
                              <Badge variant={req.supply_orders.status === 'delivered' ? 'default' : 'secondary'} className="text-[10px]">
                                {req.supply_orders.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">No recent supply requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Details */}
          <div className="space-y-8">
            <Card className="border-none shadow-md bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Supplier Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.suppliers ? (
                  <>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Main Supplier</p>
                      <p className="text-lg font-bold text-blue-700">{item.suppliers.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium">{item.suppliers.contact_person}</p>
                      <p className="text-sm text-muted-foreground">{item.suppliers.email}</p>
                      <p className="text-sm text-muted-foreground">{item.suppliers.phone}</p>
                    </div>
                    <Button asChild variant="link" className="p-0 h-auto text-blue-600 font-bold">
                      <Link href={`/admin/suppliers/${item.suppliers.id}`}>View Supplier Profile</Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-amber-700">No primary supplier assigned to this item.</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                       <Link href={`/admin/inventory/${item.id}/edit`}>Assign Supplier</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Stock Lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Last Stock Update</p>
                  {lastUpdate && lastUpdate.supply_orders && lastUpdate.supply_orders.delivered_at ? (
                    <div>
                      <p className="text-sm font-bold text-slate-800">{format(new Date(lastUpdate.supply_orders.delivered_at), 'MMMM dd, yyyy HH:mm')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Received {lastUpdate.quantity} {item.unit} at KSH {lastUpdate.unit_cost}/unit</p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">No delivery history recorded yet.</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Created At</p>
                  <p className="text-sm font-bold text-slate-800">{format(new Date(item.created_at), 'MMMM dd, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
