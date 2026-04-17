"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeConfig } from "@/lib/themes"

export interface SiteHeaderProps {
  user?: User | null
  profile?: {
    full_name?: string | null
    role?: string
    is_admin?: boolean
    email_confirmed?: boolean
  } | null
  cartItemCount?: number
  theme?: ThemeConfig
  branding?: {
    title?: string
    subtitle?: string
    logoUrl?: string
  }
}

export function SiteHeader({ user, profile, cartItemCount = 0, theme, branding }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isCatering = pathname.startsWith("/catering")
  const headerLayout = theme?.layout.header || 'classic'

  return (
    <header className={cn(
      "fixed top-4 left-0 right-0 z-[100] px-4 pointer-events-none transition-all duration-500",
      headerLayout === 'centered' && "top-8",
      headerLayout === 'transparent' && "top-0"
    )}>
      <div className={cn(
        "container mx-auto flex items-center justify-between pointer-events-auto shadow-2xl transition-all duration-500",
        headerLayout === 'classic' && "bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-3",
        headerLayout === 'transparent' && "bg-transparent border-none px-6 py-3 shadow-none",
        headerLayout === 'centered' && "flex-col gap-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 max-w-4xl"
      )}>
        <Link href="/" className={cn(
          "flex items-center gap-2 group transition-all",
          headerLayout === 'centered' && "flex-col text-center"
        )}>
          <div className="relative">
            <div className={cn(
              "absolute -inset-2 rounded-full opacity-0 group-hover:opacity-20 transition-opacity",
              "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
            )} />
            <img 
              src={branding?.logoUrl || (theme?.id === 'swahili' ? "/placeholder-logo.svg" : (theme?.palette.background === '#000000' ? "/placeholder-logo.svg" : "/placeholder-logo.png"))} 
              alt={branding?.title || "Mama Jos"} 
              className={cn(
                "h-10 w-auto transition-all",
                !branding?.logoUrl && (theme?.id === 'swahili' ? "brightness-100" : (theme?.palette.background === '#000000' ? "brightness-0 invert" : "brightness-100"))
              )} 
            />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-xl font-bold tracking-tight leading-none",
              theme?.typography.heading || "font-serif italic",
              headerLayout === 'centered' ? "text-2xl text-[var(--foreground)]" : "text-white"
            )}>
              {branding?.title || "Mama Jos"}
            </span>
            <span className="text-[10px] font-bold text-[var(--primary)] tracking-[0.2em] uppercase">
              {branding?.subtitle || "Malindi"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={cn(
          "hidden md:flex items-center gap-6",
          headerLayout === 'centered' && "bg-black/20 rounded-full px-8 py-3"
        )}>
          {[
            { label: "Menu", href: "/menu" },
            { label: "Offers & Events", href: "/offers-events" },
            { label: "Diary", href: "/diary" },
            { label: "Outside Catering", href: "/catering" },
          ].map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--primary)]",
                headerLayout === 'centered' ? "text-white/80" : "text-white/90"
              )}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link 
              href="/orders" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--primary)]",
                headerLayout === 'centered' ? "text-white/80" : "text-white/90"
              )}
            >
              Orders
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <UserNav user={user} profile={profile} />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="bg-[var(--primary)] text-white hover:opacity-90" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 mt-4 md:hidden py-6 px-4 space-y-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-top-4">
            <Link
              href="/menu"
              className="block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/offers-events"
              className="block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Offers & Events
            </Link>
            <Link
              href="/diary"
              className="block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Diary
            </Link>
            <Link
              href="/catering"
              className="block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Outside Catering
            </Link>
            {user ? (
              <Link
                href="/orders"
                className="block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
            ) : (
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <Button variant="ghost" className="text-white hover:bg-white/10 w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="bg-[var(--primary)] text-white w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
