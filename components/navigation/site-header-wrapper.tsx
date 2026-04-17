"use client"

import { SiteHeader } from "./site-header"
import { useCart } from "@/lib/cart"
import type { User } from "@supabase/supabase-js"
import { ThemeConfig } from "@/lib/themes"
import { useEffect, useState } from "react"

interface SiteHeaderWrapperProps {
  user?: User | null
  profile?: {
    full_name?: string | null
    role?: string
    is_admin?: boolean
    email_confirmed?: boolean
  } | null
  theme?: ThemeConfig
  branding?: {
    title?: string
    subtitle?: string
    logoUrl?: string
  }
}

export function SiteHeaderWrapper({ user, profile, theme, branding }: SiteHeaderWrapperProps) {
  const { getTotalItems, _hasHydrated } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="fixed top-4 left-0 right-0 z-[100] px-4 pointer-events-none">
        <div className="container mx-auto flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 pointer-events-auto shadow-2xl">
          <div className="h-10 w-32 bg-white/10 animate-pulse rounded" />
          <div className="h-8 w-64 bg-white/10 animate-pulse rounded" />
        </div>
      </header>
    )
  }

  const cartItemCount = _hasHydrated ? getTotalItems() : 0

  return (
    <SiteHeader 
      user={user} 
      profile={profile} 
      cartItemCount={cartItemCount} 
      theme={theme} 
      branding={branding}
    />
  )
}
