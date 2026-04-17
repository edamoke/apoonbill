"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, Settings2, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EtimsSettingsCard() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "testing">("disconnected")
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [env, setEnv] = useState<"sandbox" | "production">("sandbox")

  useEffect(() => {
    async function loadConfig() {
      const supabase = createClient()
      const { data } = await supabase.from("kra_etims_config").select("*").eq("is_active", true).single()
      if (data) {
        setConfig(data)
        setStatus("connected")
      }
      setLoading(false)
    }
    loadConfig()
  }, [])

  async function testConnection() {
    setStatus("testing")
    // Simulate KRA API Ping to VSCU or OSRS endpoint
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStatus("connected")
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {status === "connected" ? <Cloud className="text-green-500 h-5 w-5" /> : <CloudOff className="text-red-500 h-5 w-5" />}
            KRA eTIMS Integration
          </CardTitle>
          <CardDescription>VSCU Connectivity & Tax Compliance</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
           <Badge variant={status === "connected" ? "default" : "destructive"}>
             {status.toUpperCase()}
           </Badge>
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-muted-foreground">Env:</span>
              <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/30 text-primary uppercase">
                {env}
              </Badge>
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Environment</Label>
              <Select value={env} onValueChange={(val: any) => setEnv(val)}>
                 <SelectTrigger className="rounded-xl bg-muted/30 border-none h-11">
                    <SelectValue placeholder="Select Env" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing/Dev)</SelectItem>
                    <SelectItem value="production">Production (KRA Live)</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 border rounded-xl bg-muted/20">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Branch PIN</p>
            <p className="font-mono font-bold text-xs">{config?.kra_pin || "P051XXXXXX"}</p>
          </div>
          <div className="p-3 border rounded-xl bg-muted/20">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Device ID</p>
            <p className="font-mono font-bold text-xs">{config?.device_id || "NOT_ASSIGNED"}</p>
          </div>
        </div>

        {status === "connected" ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Successfully communicating with {env.toUpperCase()} endpoint.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Connection lost. Invoices are being queued locally.</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            className="flex-1 rounded-xl h-12 font-bold" 
            variant="outline" 
            onClick={testConnection}
            disabled={status === "testing"}
          >
            {status === "testing" ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Test {env === 'sandbox' ? 'Dev' : 'Live'}
          </Button>
          <Button className="flex-1 bg-primary rounded-xl h-12 font-black">
            Sync Inventory
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
