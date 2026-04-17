"use client"

import { useState, useEffect } from "react"
import { 
  Play, 
  Square, 
  Sun, 
  Moon, 
  AlertCircle,
  Clock,
  History,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  openBusinessDay, 
  closeBusinessDay, 
  getActiveBusinessDay,
  startShift,
  endShift
} from "@/app/actions/shift-actions"
import { getServerTime } from "@/app/actions/sync-time-actions"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function BusinessDayManager({ isAdmin = false }) {
  const { toast } = useToast()
  const [activeDay, setActiveDay] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [machineTime, setMachineTime] = useState<string>("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadActiveDay()
    syncTime()
    const timer = setInterval(syncTime, 60000) // Sync every minute
    return () => clearInterval(timer)
  }, [])

  async function syncTime() {
    const time = await getServerTime()
    setMachineTime(new Date(time).toLocaleTimeString())
  }

  async function loadActiveDay() {
    setLoading(true)
    const { data } = await getActiveBusinessDay()
    setActiveDay(data)
    setLoading(false)
  }

  async function handleOpenDay() {
    try {
      const { error } = await openBusinessDay(notes)
      if (error) throw error
      toast({ title: "Business Day Opened" })
      setNotes("")
      loadActiveDay()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  async function handleCloseDay() {
    if (!activeDay) return
    try {
      const { error } = await closeBusinessDay(activeDay.id, notes)
      if (error) throw error
      toast({ title: "Business Day Closed" })
      setNotes("")
      loadActiveDay()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  if (loading) return <div>Loading day status...</div>

  return (
    <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" /> Business Day Control
            </CardTitle>
            <CardDescription>Comprehensive venue opening and closing</CardDescription>
          </div>
          <div className="text-right">
             <div className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground mb-1">
                <Clock className="h-3 w-3" /> Machine Time
             </div>
             <div className="text-xl font-mono font-bold tabular-nums text-primary">{machineTime}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {activeDay ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
               <div>
                  <div className="text-xs uppercase font-black text-emerald-600 mb-1">Current Status</div>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">ACTIVE DAY OPEN</Badge>
               </div>
               <div className="text-right">
                  <div className="text-xs uppercase font-black text-muted-foreground mb-1">Started At</div>
                  <div className="text-sm font-bold">{format(new Date(activeDay.opened_at), 'PPP p')}</div>
               </div>
            </div>
            
            <div className="space-y-2">
              <Label>Closing Notes / End of Day Report</Label>
              <Textarea 
                placeholder="Enter sales summary, cash counts, or issues encountered..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-destructive/20"
              onClick={handleCloseDay}
              disabled={!isAdmin}
            >
              <Moon className="mr-2 h-4 w-4" /> CLOSE BUSINESS DAY
            </Button>
            {!isAdmin && (
              <p className="text-[10px] text-center text-muted-foreground italic">
                Only Administrators can close the business day.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-700">
               <AlertCircle className="h-5 w-5 shrink-0" />
               <p className="text-sm font-medium">The system is currently CLOSED for business. No shifts can be started.</p>
            </div>

            <div className="space-y-2">
              <Label>Opening Notes</Label>
              <Textarea 
                placeholder="Enter opening float status or morning checks..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>

            <Button 
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
              onClick={handleOpenDay}
              disabled={!isAdmin}
            >
              <Play className="mr-2 h-4 w-4" /> OPEN VENUE FOR BUSINESS
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
