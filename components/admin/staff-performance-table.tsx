"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, ShieldAlert, ShieldCheck, Clock, TrendingUp, Calendar, AlertCircle, FileBarChart } from "lucide-react"
import { toggleStaffSuspension } from "@/app/actions/employee-performance-actions"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Shift {
  id: string
  start_time: string
  end_time: string | null
  status: string
}

interface StaffPerformanceData {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  totalSales: number
  referredCount: number
  recentShifts: Shift[]
  daysMissed: number
  activeDays: number
  extraHours: number
  is_suspended?: boolean
}

interface StaffPerformanceTableProps {
  data: StaffPerformanceData[]
}

export function StaffPerformanceTable({ data }: StaffPerformanceTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleSuspension = async (staffId: string, currentStatus: boolean) => {
    setLoadingId(staffId)
    const result = await toggleStaffSuspension(staffId, !currentStatus)
    if (result.success) {
      toast({
        title: "Success",
        description: `Staff member ${!currentStatus ? 'suspended' : 'activated'} successfully`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      })
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sales/Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.reduce((acc, curr) => acc + curr.totalSales, 0) / (data.length || 1))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.referredCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((data.reduce((acc, curr) => acc + curr.activeDays, 0) / (data.length || 1)) / 30 * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Sales Performance</TableHead>
              <TableHead className="text-right">Referred Clients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/staff/${staff.id}`} className="block text-left hover:text-primary transition-colors">
                    <div>{staff.full_name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{staff.email}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {staff.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {formatCurrency(staff.totalSales)}
                </TableCell>
                <TableCell className="text-right">
                  {staff.referredCount}
                </TableCell>
                <TableCell>
                  {staff.is_suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/staff/${staff.id}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Profile & Reports
                      </Link>
                    </Button>
                    <Button 
                      variant={staff.is_suspended ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleSuspension(staff.id, !!staff.is_suspended)}
                      disabled={loadingId === staff.id}
                    >
                      {staff.is_suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
