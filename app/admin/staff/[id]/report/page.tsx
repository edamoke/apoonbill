import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  User, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Undo2, 
  Calendar,
  FileText,
  Printer
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PrintReportSimpleButton } from "@/components/admin/staff/print-report-button"

export default async function StaffProfileReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  // 2. Fetch Orders (Sales & Fulfillment)
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("created_by", id)
    .order("created_at", { ascending: false })

  // 3. Fetch Shifts
  const { data: shifts } = await supabase
    .from("staff_shifts")
    .select("*")
    .eq("user_id", id)
    .order("start_time", { ascending: false })

  // Calculate Metrics
  const totalSales = orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price), 0) || 0
  const totalOrders = orders?.length || 0
  const fulfilledOrders = orders?.filter(o => o.status === 'completed').length || 0
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
  const calledBackOrders = orders?.filter(o => o.status === 'returned').length || 0 // Assuming 'returned' status for callback

  const totalHours = shifts?.reduce((sum, s) => {
    if (s.start_time && s.end_time) {
      return sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)
    }
    return sum
  }, 0) || 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 print:p-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground capitalize">{profile.role} • {profile.email}</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <PrintReportSimpleButton />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</div>
            <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{fulfilledOrders} of {totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
            <Clock className="h-4 w-4 text-blue-600 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Call Backs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{calledBackOrders}</div>
            <Undo2 className="h-4 w-4 text-orange-600 mt-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Performance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0,8)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'cancelled' ? 'destructive' : 'secondary'
                      } className="text-[10px]">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Shift Management Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Shift Log (Time In / Out)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts?.slice(0, 10).map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="text-xs">{new Date(shift.start_time).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs">{new Date(shift.start_time).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-xs">
                      {shift.end_time ? new Date(shift.end_time).toLocaleTimeString() : <Badge variant="secondary">Active</Badge>}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {shift.end_time 
                        ? `${((new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)}h`
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Summary Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Comprehensive Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4 text-green-500" />
                 Fullfilled Orders
              </p>
              <p className="text-3xl font-bold">{fulfilledOrders}</p>
           </div>
           <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <XCircle className="h-4 w-4 text-red-500" />
                 Cancelled Orders
              </p>
              <p className="text-3xl font-bold">{cancelledOrders}</p>
           </div>
           <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Undo2 className="h-4 w-4 text-orange-500" />
                 Called Back Orders
              </p>
              <p className="text-3xl font-bold">{calledBackOrders}</p>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
