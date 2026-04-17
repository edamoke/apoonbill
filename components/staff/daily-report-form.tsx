"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitDailyReport } from "@/app/actions/employee-actions"

interface DailyReportFormProps {
  shiftId?: string
}

export function DailyReportForm({ shiftId }: DailyReportFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await submitDailyReport(formData)
    setLoading(false)

    if (result.success) {
      toast({
        title: "Success",
        description: "Your daily report has been submitted.",
      })
      router.refresh()
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Report</CardTitle>
        <CardDescription>Submit your end-of-shift report and tasks completed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {shiftId && <input type="hidden" name="shift_id" value={shiftId} />}
          
          <div className="space-y-2">
            <Label htmlFor="tasks_completed">Tasks Completed</Label>
            <Textarea 
              id="tasks_completed" 
              name="tasks_completed" 
              placeholder="What did you accomplish today?"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issues_encountered">Issues Encountered</Label>
            <Textarea 
              id="issues_encountered" 
              name="issues_encountered" 
              placeholder="Any technical or operational issues?" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_feedback">Customer Feedback</Label>
            <Textarea 
              id="customer_feedback" 
              name="customer_feedback" 
              placeholder="What are customers saying?" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash_reported">Cash in Drawer (if applicable)</Label>
            <Input 
              id="cash_reported" 
              name="cash_reported" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Daily Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
