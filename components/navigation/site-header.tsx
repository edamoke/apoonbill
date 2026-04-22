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
        "container mx-auto grid grid-cols-3 items-center transition-all duration-500 px-6",
      )}>
        {/* Desktop Navigation - Left */}
        <nav className={cn(
          "hidden md:flex items-center gap-6 justify-start"
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
                  className={cn("block text-lg font-jelligun transition-colors",
                    scrolled ? "text-gray-700 hover:text-[var(--primary)]" : "text-white hover:text-[var(--primary)]",
                    theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
        </nav>

        {/* Logo - Center */}
        <div className="flex justify-center">
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
                  scrolled ? "h-12" : "h-20", // Scale logo down on scroll
                  "w-auto transition-all",
                  !branding?.logoUrl && (theme?.id === 'swahili' ? "brightness-100" : (theme?.palette.background === '#000000' ? "brightness-0 invert" : "brightness-100")),
                  scrolled && theme?.palette.background !== '#000000' && "brightness-0" // Make placeholder logo dark on white background
                )} 
              />
            </div>
            <div className={cn("flex flex-col transition-all", scrolled ? "scale-75 origin-top" : "scale-100")}>
              <span className={cn(
                "text-2xl font-bold tracking-tight leading-none",
                scrolled ? "text-gray-800" : "text-white",
                theme?.typography.heading || "font-serif italic"
              )}>
                {branding?.title || "THE SPOONBILL"}
              </span>
              <span className={cn("text-xs font-bold text-[var(--primary)] tracking-[0.2em] uppercase")}>
                {branding?.subtitle || "Malindi"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 justify-end">
          {user && (
             <Link 
             href="/orders" 
             className={cn(
               "hidden md:block text-sm font-jelligun transition-colors",
               scrolled ? "text-gray-700 hover:text-[var(--primary)]" : "text-white hover:text-[var(--primary)]"
             )}
           >
             Orders
           </Link>
          )}
          <Button variant="ghost" size="icon" className={cn("relative transition-colors", scrolled ? "text-gray-700 hover:bg-black/5" : "text-white hover:bg-white/10")} asChild>
            <Link href="/cart">
              <ShoppingCart className={cn("h-5 w-5", scrolled ? "text-gray-700" : "text-white")} />
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
              <Button variant="ghost" className={cn("font-jelligun", scrolled ? "text-gray-700 hover:bg-black/5" : "text-white hover:bg-white/10")} asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className={cn("bg-[var(--primary)] text-white hover:opacity-90 font-jelligun")} asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden transition-colors", scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10", theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)] hover:bg-[var(--foreground)]/10")}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className={cn("absolute top-full left-0 right-0 mt-4 md:hidden py-6 px-4 space-y-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl animate-in fade-in slide-in-from-top-4",
            theme?.id === 'marco-good' && headerLayout === 'centered' && "bg-[var(--background)]/90 border-[var(--foreground)]/10"
          )}>
            <Link
              href="/menu"
              className={cn("block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/offers-events"
              className={cn("block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Offers & Events
            </Link>
            <Link
              href="/diary"
              className={cn("block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Diary
            </Link>
            <Link
              href="/catering"
              className={cn("block text-lg font-medium text-white/90 hover:text-[var(--primary)] transition-colors",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Outside Catering
            </Link>
            {user ? (
              <Link
                href="/orders"
                className={cn("block text-lg font-jelligun text-white/90 hover:text-[var(--primary)] transition-colors",
                  theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)]/90 hover:text-[var(--primary)]"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
            ) : (
              <div className={cn("flex flex-col gap-4 pt-4 border-t border-white/10",
                theme?.id === 'marco-good' && headerLayout === 'centered' && "border-[var(--foreground)]/10"
              )}>
                <Button variant="ghost" className={cn("text-white hover:bg-white/10 w-full font-jelligun",
                  theme?.id === 'marco-good' && headerLayout === 'centered' && "text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
                )} asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className={cn("bg-[var(--primary)] text-white w-full font-jelligun",
                  theme?.id === 'marco-good' && headerLayout === 'centered' && "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                )} asChild onClick={() => setMobileMenuOpen(false)}>
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
