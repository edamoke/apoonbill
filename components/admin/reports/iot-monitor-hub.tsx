"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  getIoTDevices, 
  syncIoTData, 
  getInventoryVarianceReport 
} from "@/app/actions/iot-actions"
import { useEffect, useState } from "react"
import { Fuel, Beer, Scale, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function IoTMonitor() {
  const [devices, setDevices] = useState<any[]>([])
  const [variance, setVariance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  async function loadData() {
    try {
      const [devs, vars] = await Promise.all([
        getIoTDevices(),
        getInventoryVarianceReport()
      ])
      setDevices(devs)
      setVariance(vars)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function handleSync(id: string) {
    setSyncing(id)
    await syncIoTData(id)
    await loadData()
    setSyncing(null)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'keg_monitor': return <Beer className="h-5 w-5 text-orange-500" />
      case 'gas_sensor': return <Fuel className="h-5 w-5 text-blue-500" />
      case 'tot_scale': return <Scale className="h-5 w-5 text-purple-500" />
      default: return <RefreshCw className="h-5 w-5" />
    }
  }

  if (loading) return <div>Initializing IoT Hub...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Bar & Alcohol IoT Monitor</h3>
        <Button size="sm" variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Live Devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((dev) => (
          <Card key={dev.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(dev.device_type)}
                  <CardTitle className="text-sm">{dev.name}</CardTitle>
                </div>
                <Badge variant={dev.status === 'online' ? 'default' : 'destructive'}>
                  {dev.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>IP: {dev.local_ip}</span>
                  <span>Last seen: {dev.last_seen_at ? new Date(dev.last_seen_at).toLocaleTimeString() : 'Never'}</span>
                </div>
                <Button 
                  className="w-full h-8 text-xs" 
                  variant="secondary"
                  disabled={syncing === dev.id}
                  onClick={() => handleSync(dev.id)}
                >
                  {syncing === dev.id ? "Syncing..." : "Sync Weight Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Variance Engine Output */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Theoretical vs Actual (24h Anomaly Detection)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variance.map((item, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold">{item.name}</span>
                  {Math.abs(item.variance) > 50 ? (
                    <Badge variant="destructive">⚠️ Significant Discrepancy</Badge>
                  ) : (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aligned
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">POS Sales</p>
                    <p className="font-semibold text-lg">{item.posUsageUnits} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Physical Pour</p>
                    <p className="font-semibold text-lg">{(item.physicalUsageGrams / 1000).toFixed(2)}L / kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variance</p>
                    <p className={`font-semibold text-lg ${item.variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}g
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Device Status</p>
                    <p className="font-semibold">{item.status || 'Unknown'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Pour Accuracy</span>
                    <span>{Math.max(0, 100 - (Math.abs(item.variance) / (item.physicalUsageGrams || 1)) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (Math.abs(item.variance) / (item.physicalUsageGrams || 1)) * 100)} className="h-1" />
                </div>
              </div>
            ))}
            {variance.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No inventory items linked to IoT scales yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
