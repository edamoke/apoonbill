"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface UserNavProps {
  user: User
  profile?: {
    full_name?: string | null
    role?: string
    is_admin?: boolean
    is_accountant?: boolean
    email_confirmed?: boolean
  } | null
}

export function UserNav({ user, profile }: UserNavProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {profile?.role && (
              <p className="text-xs leading-none text-muted-foreground capitalize mt-1">Role: {profile.role}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/orders")}>Orders</DropdownMenuItem>
        {(profile?.is_admin || profile?.role === "admin") && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Panel</DropdownMenuItem>
        )}
        {profile?.role === "chef" && (
          <DropdownMenuItem onClick={() => router.push("/chef")}>Chef Dashboard</DropdownMenuItem>
        )}
        {profile?.role === "rider" && (
          <DropdownMenuItem onClick={() => router.push("/rider")}>Rider Dashboard</DropdownMenuItem>
        )}
        {(profile?.role === "accountant" || profile?.is_accountant || profile?.is_admin || profile?.role === "admin") && (
          <DropdownMenuItem onClick={() => router.push("/accountant")}>Accountant Dashboard</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
