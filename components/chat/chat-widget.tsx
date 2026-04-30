"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, User, Bot, ShoppingBag, Truck, Zap, Flame, Star, Utensils } from "lucide-react"

export function ChatWidget({ title = "Spoonbill Fast-Food Pro" }: { title?: string }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const [localInput, setLocalInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const safeAppend = useCallback(async (content: string) => {
    const userMessage = { role: 'user', content, id: Date.now().toString() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const validMessages = [...messages, userMessage].filter(m => m.content && m.content.trim() !== "")

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: validMessages }),
      })

      if (!response.ok) throw new Error(response.statusText)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const assistantMessage = { role: 'assistant', content: '', id: (Date.now() + 1).toString() }
      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const newMsgs = [...prev]
          const lastMsg = newMsgs[newMsgs.length - 1]
          if (lastMsg.role === 'assistant') {
            lastMsg.content += text
          }
          return newMsgs
        })
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong! Hit me up again.", id: (Date.now() + 2).toString() }])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return

    const content = localInput
    setLocalInput("")
    await safeAppend(content)
  }

  useEffect(() => {
    setIsMounted(true)
    
    // Auto-engage visitor with high energy
    const hasBeenGreeted = sessionStorage.getItem('spoonbill_greeted');
    if (!hasBeenGreeted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        safeAppend("Hello! I've just arrived at The Spoonbill. What do you recommend for a first-time visitor today?");
        sessionStorage.setItem('spoonbill_greeted', 'true');
      }, 3500);
      return () => clearTimeout(timer);
    }

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isMounted) return null

  return (
    <>
      {/* Bold Red Fast-Food Button */}
      {!isOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_8px_30px_rgb(220,38,38,0.4)] z-50 hover:scale-110 transition-all duration-300 bg-red-600 hover:bg-red-700 border-4 border-yellow-400 p-0"
          onClick={() => setIsOpen(true)}
        >
          <div className="relative">
             <Utensils className="h-7 w-7 text-white" />
             <span className="absolute -top-4 -right-4 flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-yellow-500 text-[10px] items-center justify-center font-bold text-red-700">DEAL</span>
             </span>
          </div>
        </Button>
      )}

      {/* Modern High-Energy Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 border-4 border-black flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-3xl font-sans">
          {/* High-Contrast Header */}
          <CardHeader className="flex-row items-center justify-between border-b-4 border-black py-4 shrink-0 bg-yellow-400 text-black">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center rotate-3 border-2 border-white shadow-md">
                  <Flame className="h-7 w-7 text-red-500 animate-pulse" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight uppercase leading-none">Menu Pro</CardTitle>
                <div className="flex items-center gap-1 mt-1">
                    <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lightning Fast Service</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-black/10 rounded-full">
              <X className="h-6 w-6 font-bold" />
            </Button>
          </CardHeader>

          {/* Punchy Message Area */}
          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-white relative"
          >
            {messages.length === 0 && (
              <div className="text-center space-y-6 py-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto -rotate-6 shadow-lg border-4 border-black">
                  <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="space-y-1 px-4">
                  <h2 className="font-black text-2xl tracking-tighter uppercase leading-tight">Hungry in Malindi?</h2>
                  <p className="text-slate-600 text-sm font-extrabold leading-tight">
                    I'm your Spoonbill Menu Pro. Let's find you the best deals and biggest flavors!
                  </p>
                </div>
                  <div className="grid grid-cols-1 gap-2 pt-2 px-4">
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter py-6 border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all"
                      onClick={() => safeAppend("Show me the hottest deals right now!")}
                    >
                      <Zap className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" /> Flash Deals
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                        variant="outline"
                        className="border-2 border-black font-black uppercase text-[10px] py-4 h-auto hover:bg-yellow-400 transition-colors"
                        onClick={() => safeAppend("Suggest a killer burger combo!")}
                        >
                        🍔 Burger Combos
                        </Button>
                        <Button 
                        variant="outline"
                        className="border-2 border-black font-black uppercase text-[10px] py-4 h-auto hover:bg-yellow-400 transition-colors"
                        onClick={() => safeAppend("Where's my food? (Track Order)")}
                        >
                        🚚 Track Order
                        </Button>
                    </div>
                  </div>
              </div>
            )}

            {messages.map((message: any) => (
              <div key={message.id} className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                  message.role === "user" ? "bg-yellow-400" : "bg-black"
                }`}>
                  {message.role === "user" ? <User className="h-4 w-4 text-black" /> : <Flame className="h-4 w-4 text-red-500" />}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black font-bold text-sm leading-tight ${
                    message.role === "user"
                      ? "bg-slate-100 text-black rounded-tr-none"
                      : "bg-white text-black rounded-tl-none border-l-8 border-l-red-600"
                  }`}
                >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-black flex items-center justify-center border-2 border-black">
                  <Flame className="h-4 w-4 text-red-500 animate-pulse" />
                </div>
                <div className="bg-slate-50 border-2 border-black rounded-xl rounded-tl-none px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Quick-Action Input */}
          <div className="border-t-4 border-black p-4 bg-yellow-400">
            <form onSubmit={handleLocalSubmit} className="flex gap-2">
              <Input
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="What are you craving?..."
                className="flex-1 bg-white border-2 border-black focus-visible:ring-red-600 h-12 text-black font-bold placeholder:text-slate-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              />
              <Button type="submit" disabled={isLoading || !localInput.trim()} className="h-12 w-12 bg-black hover:bg-slate-900 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                <Send className="h-5 w-5 text-white" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  )
}
