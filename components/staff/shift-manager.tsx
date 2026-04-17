"use client"

import { useState, useEffect } from "react"
import { 
  Play, 
  Square, 
  User, 
  Clock, 
  Banknote, 
  AlertTriangle,
  FileText,
  BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  startShift, 
  endShift, 
  getActiveBusinessDay 
} from "@/app/actions/shift-actions"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function ShiftManager() {
  const { toast } = useToast()
  const supabase = createClient()
  const [activeDay, setActiveDay] = useState<any>(null)
  const [currentShift, setCurrentShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openingFloat, setOpeningFloat] = useState<string>("")
  const [actualCash, setActualCash] = useState<string>("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    setLoading(true)
    const { data: day } = await getActiveBusinessDay()
    setActiveDay(day)

    if (day) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: shift } = await supabase
          .from('pos_shifts')
          .select('*')
          .eq('staff_id', user.id)
          .eq('status', 'open')
          .single()
        setCurrentShift(shift)
      }
    }
    setLoading(false)
  }

  async function handleStartShift() {
    if (!activeDay) return
    try {
      const float = parseFloat(openingFloat) || 0
      const { error } = await startShift(activeDay.id, float, notes)
      if (error) throw error
      toast({ title: "Shift Started" })
      setOpeningFloat("")
      setNotes("")
      loadStatus()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  async function handleEndShift() {
    if (!currentShift) return
    try {
      const cash = parseFloat(actualCash) || 0
      const { error } = await endShift(currentShift.id, cash, notes)
      if (error) throw error
      toast({ title: "Shift Ended Successfully" })
      setActualCash("")
      setNotes("")
      loadStatus()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  if (loading) return <div>Loading shift details...</div>

  if (!activeDay) {
    return (
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="pt-6 text-center space-y-2">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-lg">Business Day Not Started</h3>
          <p className="text-sm text-muted-foreground">The venue is not yet open for business. Please contact a manager to open the day.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg overflow-hidden border-2 border-primary/5">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" /> Staff Shift Control
        </CardTitle>
        <CardDescription>Manage your individual working session</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {currentShift ? (
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20">
               <div>
                  <div className="text-[10px] uppercase font-black text-primary/60 mb-1">Shift Duration</div>
                  <div className="flex items-center gap-2 font-mono font-bold">
                     <Clock className="h-3 w-3" />
                     {format(new Date(currentShift.opened_at), 'p')} - NOW
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] uppercase font-black text-primary/60 mb-1">Expected Cash</div>
                  <div className="text-lg font-black text-primary">KES {currentShift.expected_cash.toLocaleString()}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Actual Cash in Drawer</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      placeholder="Counted cash..." 
                      className="pl-10 h-10 rounded-xl"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label>Opening Float (Read-only)</Label>
                  <Input value={`KES ${currentShift.opening_float}`} disabled className="h-10 rounded-xl bg-muted" />
               </div>
            </div>
            
            <div className="space-y-2">
              <Label>Shift Notes / Handover</Label>
              <Textarea 
                placeholder="Any incidents, tips, or handover notes..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <Button 
              variant="default" 
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90"
              onClick={handleEndShift}
            >
              <Square className="mr-2 h-4 w-4" /> END MY SHIFT
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-700">
               <BadgeCheck className="h-5 w-5 shrink-0" />
               <p className="text-sm font-medium italic">Business day is active. You can now start your shift.</p>
            </div>

            <div className="space-y-2">
              <Label>Starting Float (Cash in Drawer)</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  className="pl-10 h-12 rounded-xl text-lg font-bold"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Anything to note before starting?" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <Button 
              className="w-full h-14 rounded-xl font-bold text-lg shadow-xl shadow-primary/20"
              onClick={handleStartShift}
              disabled={!openingFloat}
            >
              <Play className="mr-2 h-5 w-5" /> START WORK SHIFT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
