"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, ShieldCheck, Key, Save, Loader2, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

export function MpesaSettingsCard() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [config, setConfig] = useState({
    shortCode: "",
    consumerKey: "",
    consumerSecret: "",
    passKey: "",
    callbackUrl: "https://starsgarters.com/api/mpesa/callback",
    isSandbox: true
  })

  const handleSave = async () => {
    setLoading(true)
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    toast({
      title: "Settings Saved",
      description: "M-Pesa integration details have been updated successfully."
    })
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
           <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                M-Pesa Express (STK Push)
              </CardTitle>
              <CardDescription>Manage Daraja API credentials and callbacks</CardDescription>
           </div>
           <div className="flex items-center gap-2">
              <Label htmlFor="sandbox" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sandbox Mode</Label>
              <Switch 
                id="sandbox" 
                checked={config.isSandbox} 
                onCheckedChange={(val) => setConfig({...config, isSandbox: val})}
              />
           </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Shortcode</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input 
                placeholder="174379" 
                className="pl-10 rounded-xl" 
                value={config.shortCode}
                onChange={(e) => setConfig({...config, shortCode: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consumer Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input 
                type="password" 
                placeholder="Enter consumer key" 
                className="pl-10 rounded-xl" 
                value={config.consumerKey}
                onChange={(e) => setConfig({...config, consumerKey: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consumer Secret</Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              type="password" 
              placeholder="Enter consumer secret" 
              className="pl-10 rounded-xl" 
              value={config.consumerSecret}
              onChange={(e) => setConfig({...config, consumerSecret: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Passkey (Lipa na M-Pesa Online)</Label>
          <Input 
            type="password" 
            placeholder="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" 
            className="rounded-xl font-mono text-xs" 
            value={config.passKey}
            onChange={(e) => setConfig({...config, passKey: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Result Callback URL</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              placeholder="https://your-domain.com/api/mpesa/callback" 
              className="pl-10 rounded-xl" 
              value={config.callbackUrl}
              onChange={(e) => setConfig({...config, callbackUrl: e.target.value})}
            />
          </div>
        </div>

        <Button className="w-full h-12 rounded-xl font-black gap-2 mt-2" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          SAVE CONFIGURATION
        </Button>
      </CardContent>
    </Card>
  )
}

function Hash(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  )
}
