import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Mail,
  Shield,
  Briefcase,
  Wallet
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PrintReportButton } from "@/components/admin/staff/print-report-button"
import { StaffDetailsForm } from "@/components/admin/staff/staff-details-form"
import { getDepartments, calculateStatutoryDeductions } from "@/app/actions/hrm-actions"

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Profile & Staff Details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, hrm_staff_details(*)")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  // 2. Fetch Departments for the form
  const departments = await getDepartments()

  // 3. Fetch Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("created_by", id)
    .order("created_at", { ascending: false })

  // 4. Fetch Shifts
  const { data: shifts } = await supabase
    .from("staff_shifts")
    .select("*")
    .eq("user_id", id)
    .order("start_time", { ascending: false })

  // Calculate Metrics
  const totalSales = orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price || (o as any).total), 0) || 0
  const totalOrders = orders?.length || 0
  const fulfilledOrders = orders?.filter(o => o.status === 'completed').length || 0
  const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0
  const calledBackOrders = orders?.filter(o => o.status === 'returned').length || 0

  const totalHours = shifts?.reduce((sum, s) => {
    if (s.start_time && s.end_time) {
      return sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60)
    }
    return sum
  }, 0) || 0

  // Calculate Payslip Preview
  const grossSalary = Number(profile.hrm_staff_details?.salary_amount || 0)
  const payslip = grossSalary > 0 ? await calculateStatutoryDeductions(grossSalary) : null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
        <Link href="/admin/hrm" className="hover:text-primary transition-colors">HRM</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Employee Profile</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-serif font-bold">{profile.full_name}</h1>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                <Briefcase className="h-3.5 w-3.5" />
                {profile.hrm_staff_details?.job_title || profile.role || 'Staff'}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                <Shield className="h-4 w-4" />
                {profile.is_suspended ? <span className="text-red-500 font-medium">Suspended</span> : <span className="text-green-500 font-medium">Active</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 print:hidden">
          <PrintReportButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Statutory/Employment Form */}
          <StaffDetailsForm 
            staff={{...profile.hrm_staff_details, id: profile.id, job_title: profile.hrm_staff_details?.job_title || profile.role}} 
            departments={departments} 
          />

          {/* Payslip Preview */}
          {payslip && (
            <Card className="border-primary/20 bg-primary/[0.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  KRA/Statutory Preview
                </CardTitle>
                <CardDescription>Estimated monthly deductions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between font-bold text-base border-b pb-2 mb-2">
                   <span>Gross Salary</span>
                   <span>{formatCurrency(payslip.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                   <span>NSSF</span>
                   <span className="text-red-500">-{formatCurrency(payslip.nssf)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                   <span>NHIF</span>
                   <span className="text-red-500">-{formatCurrency(payslip.nhif)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                   <span>Housing Levy</span>
                   <span className="text-red-500">-{formatCurrency(payslip.housingLevy)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                   <span>PAYE (Tax)</span>
                   <span className="text-red-500">-{formatCurrency(payslip.paye)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-4 text-primary">
                   <span>Net Take Home</span>
                   <span>{formatCurrency(payslip.netSalary)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-primary/[0.02] border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Operational Summary</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Total Sales</span>
                </div>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalSales)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Fullfilled</span>
                </div>
                <span className="text-lg font-bold">{fulfilledOrders}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Total Hours</span>
                </div>
                <span className="text-lg font-bold">{totalHours.toFixed(1)} hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
           {/* Shift Management Detail */}
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Attendance Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shifts?.slice(0, 10).map((shift) => (
                  <div key={shift.id} className="p-3 rounded-lg border bg-card hover:shadow-sm transition-all space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">{new Date(shift.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <Badge variant={shift.end_time ? "outline" : "secondary"} className="text-[10px]">
                        {shift.end_time ? 'Completed' : 'On Shift'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 text-xs text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">In</p>
                        <p>{new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">Out</p>
                        <p>{shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Sales & Fulfillment Report
                </CardTitle>
                <CardDescription>Comprehensive breakdown of recent transactions</CardDescription>
              </div>
              <div className="text-right">
                 <p className="text-xs text-muted-foreground">Success Rate</p>
                 <p className="text-2xl font-bold text-primary">
                   {totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 0}%
                 </p>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Order Info</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.slice(0, 10).map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell>
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          #{order.id.slice(0,8).toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'cancelled' ? 'destructive' : 
                          order.status === 'returned' ? 'secondary' : 'outline'
                        } className="text-[10px] capitalize font-medium">
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total_price || order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
