"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Printer, Save, RefreshCw, Smartphone, MapPin, Hash, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function ReceiptSettingsCard() {
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    restaurant_name: "Mama Jos",
    address: "Nairobi, Kenya",
    phone: "+254 700 000 000",
    kra_pin: "P051XXXXXXX",
    tax_number: "ETIMS-XXXX-XXXX",
    receipt_header: "Welcome to Mama Jos",
    receipt_footer: "Thank you for dining with us!",
    show_logo: true,
    show_qr: true
  })

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "receipt_config")
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
          key: "receipt_config", 
          value: settings,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      toast({ title: "Settings Saved", description: "Receipt configuration updated successfully." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border shadow-sm md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Receipt Designer & KRA Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input 
                  value={settings.restaurant_name} 
                  onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9"
                    value={settings.phone} 
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9"
                  value={settings.address} 
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  KRA PIN
                  <Badge variant="secondary" className="text-[10px] h-4">REQUIRED</Badge>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9 font-mono"
                    value={settings.kra_pin} 
                    onChange={(e) => setSettings({...settings, kra_pin: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>eTIMS Device ID</Label>
                <Input 
                  className="font-mono"
                  value={settings.tax_number} 
                  onChange={(e) => setSettings({...settings, tax_number: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Header Message</Label>
              <Input 
                value={settings.receipt_header} 
                onChange={(e) => setSettings({...settings, receipt_header: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Footer Message</Label>
              <Input 
                value={settings.receipt_footer} 
                onChange={(e) => setSettings({...settings, receipt_footer: e.target.value})}
              />
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full h-11 rounded-xl">
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Receipt Configuration
            </Button>
          </div>

          {/* Preview */}
          <div className="bg-muted/30 rounded-2xl p-6 border-2 border-dashed flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Live Preview</span>
            <div className="bg-white text-black p-6 w-[300px] shadow-2xl font-mono text-sm space-y-2 min-h-[500px]">
               <div className="text-center border-b border-black pb-2 mb-2">
                  <div className="h-12 w-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-1">
                     <span className="font-serif text-xl">M</span>
                  </div>
                  <h3 className="font-bold text-lg uppercase">{settings.restaurant_name}</h3>
                  <p className="text-[10px]">{settings.address}</p>
                  <p className="text-[10px]">TEL: {settings.phone}</p>
               </div>

               <div className="text-[10px] space-y-0.5">
                  <p className="flex justify-between"><span>KRA PIN:</span> <span>{settings.kra_pin}</span></p>
                  <p className="flex justify-between"><span>ETIMS ID:</span> <span>{settings.tax_number}</span></p>
                  <p className="flex justify-between"><span>DATE:</span> <span>{new Date().toLocaleString()}</span></p>
                  <p className="flex justify-between"><span>CASHIER:</span> <span>SYSTEM ADMIN</span></p>
               </div>

               <div className="border-y border-black border-dashed py-2 my-2">
                  <table className="w-full text-[10px]">
                     <thead>
                        <tr className="border-b border-black">
                           <th className="text-left">ITEM</th>
                           <th className="text-center">QTY</th>
                           <th className="text-right">PRICE</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td>SIGNATURE BURGER</td>
                           <td className="text-center">2</td>
                           <td className="text-right">1,600.00</td>
                        </tr>
                        <tr>
                           <td>HOUSE COFFEE</td>
                           <td className="text-center">1</td>
                           <td className="text-right">250.00</td>
                        </tr>
                     </tbody>
                  </table>
               </div>

               <div className="text-right space-y-0.5 border-b border-black pb-2">
                  <p className="flex justify-between text-xs"><span>SUBTOTAL:</span> <span>KES 1,850.00</span></p>
                  <p className="flex justify-between text-xs"><span>VAT (16%):</span> <span>KES 296.00</span></p>
                  <p className="flex justify-between font-bold text-base"><span>TOTAL:</span> <span>KES 2,146.00</span></p>
               </div>

               <div className="text-center pt-4 space-y-2">
                  <p className="text-[10px] italic">{settings.receipt_footer}</p>
                  <div className="h-20 w-20 border-2 border-black mx-auto flex items-center justify-center">
                     <span className="text-[8px] text-center">QR CODE<br/>VERIFIED</span>
                  </div>
                  <p className="text-[8px] font-bold">SERIAL: SG-{Math.random().toString(36).substring(7).toUpperCase()}</p>
               </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
