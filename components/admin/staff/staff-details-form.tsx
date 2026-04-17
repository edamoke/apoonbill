"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { updateStaffDetail } from "@/app/actions/hrm-actions"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StaffDetailsForm({ staff, departments }: { staff: any, departments: any[] }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const updates = {
      job_title: formData.get("job_title"),
      department_id: formData.get("department_id"),
      employment_type: formData.get("employment_type"),
      salary_amount: formData.get("salary_amount"),
      kra_pin: formData.get("kra_pin"),
      nhif_number: formData.get("nhif_number"),
      nssf_number: formData.get("nssf_number"),
      id_number: formData.get("id_number"),
      date_joined: formData.get("date_joined")
    }

    try {
      await updateStaffDetail(staff.id, updates)
      toast({ title: "Success", description: "Staff details updated" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment & Statutory Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input name="job_title" defaultValue={staff.job_title} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select name="department_id" defaultValue={staff.department_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select name="employment_type" defaultValue={staff.employment_type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gross Salary (KES)</Label>
              <Input name="salary_amount" type="number" defaultValue={staff.salary_amount} />
            </div>
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input name="id_number" defaultValue={staff.id_number} />
            </div>
            <div className="space-y-2">
              <Label>KRA PIN</Label>
              <Input name="kra_pin" defaultValue={staff.kra_pin} />
            </div>
            <div className="space-y-2">
              <Label>NHIF Number</Label>
              <Input name="nhif_number" defaultValue={staff.nhif_number} />
            </div>
            <div className="space-y-2">
              <Label>NSSF Number</Label>
              <Input name="nssf_number" defaultValue={staff.nssf_number} />
            </div>
            <div className="space-y-2">
              <Label>Date Joined</Label>
              <Input name="date_joined" type="date" defaultValue={staff.date_joined?.split('T')[0]} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Update Staff Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
