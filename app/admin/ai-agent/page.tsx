"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, TrendingUp, Package, Users, Activity, AlertTriangle } from "lucide-react"
import { processAgentCommand, executeAgentAction } from "@/app/actions/ai-agent-actions"
import { checkSystemAnomalies } from "@/app/actions/ai-anomaly-actions"
import { toast } from "@/hooks/use-toast"
import { useEffect } from "react"

export default function AIAgentPage() {
  const [command, setCommand] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'agent', message: string, action?: string, params?: any }[]>([])

  useEffect(() => {
    async function loadAnomalies() {
      const data = await checkSystemAnomalies()
      setAnomalies(data)
    }
    loadAnomalies()
    const interval = setInterval(loadAnomalies, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function handleSendCommand() {
    if (!command.trim()) return

    setIsProcessing(true)
    const userMsg = command
    setChatHistory(prev => [...prev, { role: 'user', message: userMsg }])
    setCommand("")

    try {
      const response = await processAgentCommand(userMsg)
      setChatHistory(prev => [...prev, { 
        role: 'agent', 
        message: response.ui_message,
        action: response.action,
        params: response.parameters
      }])
    } catch (error) {
      toast({ title: "AI Error", description: "Failed to process command", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  async function runAction(action: string, params: any) {
    try {
      const result = await executeAgentAction(action, params)
      if (result.success) {
        toast({ title: "Action Executed", description: result.message })
        setChatHistory(prev => [...prev, { role: 'agent', message: `✅ ${result.message}` }])
      }
    } catch (error) {
      toast({ title: "Execution Failed", description: "Could not complete the AI requested action." })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">AI Command Center</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm font-medium border-primary/50">
          <Activity className="mr-1 h-3 w-3 text-green-500 animate-pulse" />
          Unified Agent Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Intelligence Feed */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="flex-1 min-h-[500px] flex flex-col">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg">Growth & Operations Intelligence</CardTitle>
              <CardDescription>Management agent analyzing CRM, Leads, and Supply Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative">
              <ScrollArea className="h-full max-h-[450px] p-6">
                <div className="flex flex-col gap-4">
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Brain className="h-12 w-12 mb-4 opacity-20" />
                      <p>Ask the agent about business performance, <br/>pending leads, or stock levels.</p>
                    </div>
                  )}
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        chat.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted border shadow-sm'
                      }`}>
                        <p className="text-sm">{chat.message}</p>
                        {chat.action && chat.action !== 'none' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="mt-3 w-full border-dashed"
                            onClick={() => runAction(chat.action!, chat.params)}
                          >
                            Execute Suggested {chat.action.replace('_', ' ')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g., 'Draft follow-ups for hot leads' or 'Check inventory levels'..." 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                  disabled={isProcessing}
                />
                <Button onClick={handleSendCommand} disabled={isProcessing}>
                  {isProcessing ? <Activity className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Key Focus Areas */}
        <div className="flex flex-col gap-6">
          {anomalies.length > 0 && (
            <Card className="border-destructive bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" /> AI Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.map((a, i) => (
                    <div key={i} className="text-xs border-l-2 border-destructive pl-2 py-1">
                      <p className="font-semibold">{a.message}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-destructive/80">
                        {a.action_hint} →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" /> CRM & Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>AI suggests focusing on:</p>
                <Badge variant="outline" className="w-full justify-start py-2">Corporate Leads (3 High Value)</Badge>
                <Badge variant="outline" className="w-full justify-start py-2">Social Media Referral Campaign</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" /> Supply Chain Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>Operational Warnings:</p>
                <div className="flex items-center justify-between">
                  <span>Stock Alerts</span>
                  <Badge variant="destructive" className="h-5">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Shipments</span>
                  <Badge variant="secondary" className="h-5">4 Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" /> Business Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>Lead Conversion Rate: 12%</p>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full w-[12%]"></div>
                </div>
                <p className="mt-2 opacity-70 italic text-[10px]">Projecting KES 450k revenue from high-interest leads this month.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
