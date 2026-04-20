import type React from "react"
import { ChatWidget } from "@/components/chat/chat-widget"

import { AccountantSidebar } from "@/components/accountant/accountant-sidebar"

export default function AccountantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AccountantSidebar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <ChatWidget title="thespoonbill Finance Assistant" />
    </div>
  )
}
