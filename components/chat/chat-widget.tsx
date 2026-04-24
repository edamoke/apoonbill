"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, User, Bot, ShoppingBag, Truck, Heart, Lock, Tag } from "lucide-react"
import Link from "next/link"

export function ChatWidget({ title = "Spoonbill Concierge" }: { title?: string }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
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
      // Filter out empty messages to prevent API errors
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again.", id: (Date.now() + 2).toString() }])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return

    const content = localInput
    setLocalInput("") // Clear input immediately
    await safeAppend(content)
  }

  useEffect(() => {
    setIsMounted(true)
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoadingUser(false)
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
      {/* Chat Button */}
      {!isOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform duration-200"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="flex-row items-center justify-between border-b border-border py-4 shrink-0 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-serif">{title}</CardTitle>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-sans">Always at your service</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-slate-50/50 relative"
          >
            {messages.length === 0 && (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-serif text-xl">Welcome to The Spoonbill</p>
                  <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    I'm your elite dining consultant. I'll help you find the best deals, navigate our delicious menu, and handle your orders with coastal elegance.
                  </p>
                </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-auto py-2 px-1 font-semibold text-primary border-primary/30" 
                      onClick={() => safeAppend("What are the current offers?")}
                    >
                      <Tag className="h-3 w-3 mr-1" /> Best Offers
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-auto py-2 px-1" 
                      onClick={() => safeAppend("Show me the menu!")}
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" /> Full Menu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-auto py-2 px-1" 
                      onClick={() => safeAppend("Where is my order?")}
                    >
                      <Truck className="h-3 w-3 mr-1" /> My Orders
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-auto py-2 px-1" 
                      onClick={() => safeAppend("Tell me about the Spoonbill experience.")}
                    >
                      <Heart className="h-3 w-3 mr-1" /> About Us
                    </Button>
                  </div>
              </div>
            )}

            {messages.map((message: any) => (
              <div key={message.id} className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                }`}>
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {message.content && (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <div className="border-t border-border p-4 shrink-0 bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.03)] relative z-50">
            <form onSubmit={handleLocalSubmit} className="flex gap-2">
              <Input
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-primary h-11 text-slate-900"
              />
              <Button type="submit" size="icon" disabled={isLoading || !localInput.trim()} className="h-11 w-11 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-[9px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">Powered by Spoonbill AI</p>
          </div>
        </Card>
      )}
    </>
  )
}
