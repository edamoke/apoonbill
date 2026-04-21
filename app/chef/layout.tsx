import type React from "react"
import { ChatWidget } from "@/components/chat/chat-widget"
import { StaffHeader } from "@/components/navigation/staff-header"
import { createClient } from "@/lib/supabase/server"

export default async function ChefLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="min-h-screen bg-background">
      {user && <StaffHeader user={user} profile={profile} />}
      <main>
        {children}
      </main>
      <ChatWidget title="Spoonbill Kitchen Assistant" />
    </div>
  )
}
