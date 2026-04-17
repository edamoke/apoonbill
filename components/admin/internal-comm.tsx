"use client"

import { useState } from "react"
import { MessageSquare, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function InternalCommunication() {
  const [messages, setMessages] = useState([
    { id: 1, user: "Chef", text: "Beef stock is running low.", time: "10:30 AM" },
    { id: 2, user: "Manager", text: "Authorized replenishment order.", time: "10:45 AM" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim()) return
    setMessages([...messages, { id: Date.now(), user: "You", text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setNewMessage("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Internal Comms
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Real-time chat between staff and management.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] p-6">
           <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">{msg.user}</span>
                      <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
                   </div>
                   <div className={`px-3 py-2 rounded-2xl text-sm ${msg.user === 'You' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                      {msg.text}
                   </div>
                </div>
              ))}
           </div>
        </ScrollArea>
        <div className="p-4 bg-muted/30 border-t flex gap-2">
           <Input 
             placeholder="Type a message..." 
             className="rounded-xl border-none bg-background focus-visible:ring-1" 
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
           />
           <Button size="icon" className="rounded-xl shrink-0" onClick={sendMessage}>
              <Send className="h-4 w-4" />
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
