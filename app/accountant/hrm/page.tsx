import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AccountantSidebar } from "@/components/accountant/accountant-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  getDepartments, 
  getStaffDetails, 
  getAttendanceToday, 
  getLeaveRequests 
} from "@/app/actions/hrm-actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, CalendarCheck, FileStack, Eye, LineChart, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default async function AccountantHRMPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  const isAccountant = profile?.is_accountant || profile?.role === "accountant" || !!profile?.custom_role_id
  const isAdmin = profile?.is_admin || profile?.role === "admin"

  if (!isAccountant && !isAdmin) {
    redirect("/dashboard")
  }

  const [departments, staff, attendance, leaves] = await Promise.all([
    getDepartments(),
    getStaffDetails(),
    getAttendanceToday(),
    getLeaveRequests()
  ])

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - HRM</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2">Payroll & HRM</h1>
            <p className="text-muted-foreground">Financial oversight of departments, staff records, and attendance.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <FileStack className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaves.filter((l: any) => l.status === 'pending').length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff" className="space-y-4">
          <TabsList>
            <TabsTrigger value="staff">Staff Directory</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Employee Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.profiles?.full_name}</TableCell>
                        <TableCell>{s.hrm_departments?.name || 'Unassigned'}</TableCell>
                        <TableCell>{s.job_title || 'N/A'}</TableCell>
                        <TableCell>{new Date(s.date_joined).toLocaleDateString()}</TableCell>
                        <TableCell>KES {s.salary_amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/accountant/orders?staff_id=${s.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Activity
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departments & Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Manager</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell>{d.description}</TableCell>
                        <TableCell>{d.profiles?.full_name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.profiles?.full_name}</TableCell>
                        <TableCell>{new Date(a.check_in).toLocaleTimeString()}</TableCell>
                        <TableCell>
                           <Badge variant={a.status === 'present' ? 'default' : 'destructive'}>
                             {a.status}
                           </Badge>
                        </TableCell>
                        <TableCell>{a.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves">
            <Card>
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.profiles?.full_name}</TableCell>
                        <TableCell className="capitalize">{l.leave_type}</TableCell>
                        <TableCell>
                          {l.start_date} to {l.end_date}
                        </TableCell>
                        <TableCell>
                           <Badge variant={l.status === 'approved' ? 'default' : l.status === 'pending' ? 'outline' : 'destructive'}>
                             {l.status}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
