"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Monitor, 
  Printer, 
  Lock, 
  Save,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { BusinessDayManager } from "@/components/admin/business-day-manager"
import { ShiftManager } from "@/components/staff/shift-manager"
import { PrinterManager } from "@/components/admin/settings/printer-manager"

import { redirect } from "next/navigation"
import { hasPermission } from "@/app/actions/rbac-check"

export default function POSSettingsPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    terminal_name: "MAIN-TERMINAL-01",
    auto_print_receipt: true,
    allow_voids: false,
    require_manager_pin_for_discount: true,
    enable_offline_mode: false,
    default_tax_rate: 16,
    currency: "KES",
    kitchen_display_system: true,
    table_management: true,
    low_stock_threshold: 10
  })

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect("/admin/sign-in")
        return
      }
      
      const canView = await hasPermission('pos_settings', 'view')
      if (!canView) {
        redirect("/dashboard")
        return
      }
    }
    checkAccess()

    async function loadSettings() {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "pos_config")
        .single()
      
      if (data?.value) {
        setSettings(data.value)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "pos_config", 
          value: settings,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      toast({ title: "Settings Saved", description: "POS configuration updated successfully." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-black italic">POS Management</h1>
          <p className="text-muted-foreground">Fine-tune terminal behavior, hardware, and operational rules.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild className="rounded-xl h-12 px-6">
              <a href="/admin">Back to Dashboard</a>
           </Button>
           <Button onClick={handleSave} disabled={loading} className="rounded-xl h-12 px-8 shadow-xl shadow-primary/20">
             {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
             Save POS Profile
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day & Shift Operations */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
           <BusinessDayManager isAdmin={true} />
           <ShiftManager />
        </div>

        {/* Terminal Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" /> Terminal Configuration
            </CardTitle>
            <CardDescription>Primary settings for this physical station.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label>Terminal Identifier</Label>
                  <Input 
                    value={settings.terminal_name} 
                    onChange={(e) => setSettings({...settings, terminal_name: e.target.value})}
                    placeholder="e.g. BAR-01"
                  />
               </div>
               <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input value={settings.currency} disabled className="bg-muted" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-2xl p-6 bg-muted/20">
               <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase font-black text-muted-foreground">Auto-Print</Label>
                  <Switch 
                    checked={settings.auto_print_receipt} 
                    onCheckedChange={(checked) => setSettings({...settings, auto_print_receipt: checked})}
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase font-black text-muted-foreground">Offline Mode</Label>
                  <Switch 
                    checked={settings.enable_offline_mode} 
                    onCheckedChange={(checked) => setSettings({...settings, enable_offline_mode: checked})}
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <Label className="text-xs uppercase font-black text-muted-foreground">Tables Mode</Label>
                  <Switch 
                    checked={settings.table_management} 
                    onCheckedChange={(checked) => setSettings({...settings, table_management: checked})}
                  />
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                   <Label>Manager Authorization</Label>
                   <p className="text-[10px] text-muted-foreground">Require PIN for discounts</p>
                </div>
                <Switch 
                  checked={settings.require_manager_pin_for_discount} 
                  onCheckedChange={(v) => setSettings({...settings, require_manager_pin_for_discount: v})}
                />
             </div>
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                   <Label>Allow Void Items</Label>
                   <p className="text-[10px] text-muted-foreground">Allow staff to remove items</p>
                </div>
                <Switch 
                  checked={settings.allow_voids} 
                  onCheckedChange={(v) => setSettings({...settings, allow_voids: v})}
                />
             </div>
             <Button variant="outline" className="w-full text-xs font-bold uppercase">Manage Staff PINs</Button>
          </CardContent>
        </Card>

        {/* Hardware & Peripherals */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" /> Hardware & Peripherals
            </CardTitle>
            <CardDescription>Configure physical devices for this terminal.</CardDescription>
          </CardHeader>
          <CardContent>
            <PrinterManager />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
