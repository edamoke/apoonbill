"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/auth/user-nav"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
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
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isCheckout = pathname === "/checkout"
  const isCatering = pathname.startsWith("/catering")
  const headerLayout = theme?.layout.header || 'classic'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
    )}>
      <div className={cn(
        "container mx-auto flex items-center justify-between transition-all duration-500 px-2 lg:px-4 xl:px-6 gap-2 lg:gap-4",
      )}>
        {/* Desktop Navigation - Left */}
        <nav className={cn(
          "hidden md:flex items-center gap-2 lg:gap-3 xl:gap-5 flex-1 justify-start"
        )}>
          {[
            { label: "Home", href: "/" },
            { label: "Drinks", href: "/menu?category=drinks" },
            { label: "Burgers", href: "/menu?category=burgers" },
            { label: "Fries", href: "/menu?category=fries" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("block text-lg lg:text-xl xl:text-2xl font-staytion transition-colors whitespace-nowrap",
                scrolled ? "text-red-600 hover:text-[var(--primary)]" : (pathname === "/" ? "text-white hover:text-[var(--primary)]" : "text-gray-700 hover:text-[var(--primary)]"),
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logo - Center */}
        <div className="flex justify-center flex-shrink-0">
          <Link href="/" className={cn(
            "flex items-center gap-4 group transition-all flex-col text-center"
          )}>
            <div className="relative">
              <div className={cn(
                "absolute -inset-4 rounded-full opacity-0 group-hover:opacity-20 transition-opacity",
                "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
              )} />
              <img 
                src={branding?.logoUrl || (theme?.id === 'swahili' ? "/placeholder-logo.svg" : (theme?.palette.background === '#000000' ? "/placeholder-logo.svg" : "/placeholder-logo.png"))} 
                alt={branding?.title || "The Spoonbill"} 
                className={cn(
                  scrolled ? "h-8 lg:h-10" : "h-10 md:h-12 lg:h-14 xl:h-18",
                  "w-auto transition-all",
                  !branding?.logoUrl && (theme?.id === 'swahili' ? "brightness-100" : (theme?.palette.background === '#000000' ? "brightness-0 invert" : "brightness-100"))
                )} 
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Right & Actions */}
        <div className="flex items-center gap-1 lg:gap-2 xl:gap-4 flex-1 justify-end">
          <nav className={cn(
            "hidden md:flex items-center gap-2 lg:gap-3 xl:gap-5"
          )}>
            {[
              { label: "Toppings", href: "/menu?category=toppings" },
              { label: "Chicken", href: "/menu?category=chicken" },
              { label: "Combo", href: "/menu?category=combo" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("block text-lg lg:text-xl xl:text-2xl font-staytion transition-colors whitespace-nowrap",
                  scrolled ? "text-red-600 hover:text-[var(--primary)]" : (pathname === "/" ? "text-white hover:text-[var(--primary)]" : "text-gray-700 hover:text-[var(--primary)]"),
                  theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {user && (
            <Link
              href="/orders"
              className={cn(
                "hidden md:block text-xs lg:text-base font-bold transition-colors relative group/orders px-1 lg:px-4 py-2",
                scrolled
                  ? "text-red-600 hover:text-[var(--primary)]"
                  : pathname === "/"
                  ? "text-white hover:text-[var(--primary)]"
                  : "text-gray-700 hover:text-[var(--primary)]"
              )}
            >
              <span className="relative z-10">Orders</span>
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md scale-0 group-hover/orders:scale-110 transition-transform duration-500 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover/orders:scale-100 transition-transform duration-300" />
            </Link>
          )}
          <Button variant="ghost" size="icon" className={cn("relative transition-colors", scrolled ? "text-red-600 hover:bg-black/5" : (pathname === "/" ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/5"))} asChild>
            <Link href="/cart">
              <ShoppingCart className={cn("h-5 w-5", scrolled ? "text-red-600" : (pathname === "/" ? "text-white" : "text-gray-700"))} />
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
            !isCheckout && (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" className={cn("font-bold", scrolled ? "text-red-600 hover:bg-black/5" : (pathname === "/" ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-black/5"))} asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className={cn("bg-[var(--primary)] text-white hover:opacity-90 font-bold")} asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )
          )}

          {/* Mobile Actions - Simplified since bottom nav handles links */}
          <div className="md:hidden flex items-center gap-2">
            {!user && !isCheckout && (
              <Button size="sm" className="bg-red-600 text-white rounded-full text-xs" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Hidden as we use Bottom Nav now */}
        {false && mobileMenuOpen && (
          <nav className={cn("absolute top-full left-0 right-0 mt-4 md:hidden py-6 px-4 space-y-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-top-4",
            theme?.id === 'marco-good' && headerLayout === 'centered' && "bg-[var(--background)]/90 border-[var(--foreground)]/10"
          )}>
            <Link
              href="/"
              className={cn("block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
