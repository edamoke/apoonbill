"use client"

import { UserNav } from "@/components/auth/user-nav"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { NotificationBell } from "@/components/navigation/notification-bell"
import { POSTerminalToggle } from "@/components/navigation/pos-terminal-toggle"
import { ModeToggle } from "@/components/theme-toggle"
import { InternalCommunication } from "@/components/admin/internal-comm"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Utensils, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface AdminHeaderProps {
  user: User
  profile: any
}

export function AdminHeader({ user, profile }: AdminHeaderProps) {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Get cart count from localStorage
    const updateCartCount = () => {
      try {
        const cartData = localStorage.getItem("cart")
        if (cartData) {
          const cart = JSON.parse(cartData)
          const totalItems = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
          setCartCount(totalItems)
        } else {
          setCartCount(0)
        }
      } catch (e) {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener("storage", updateCartCount)
    // Custom event for same-window updates
    window.addEventListener("cartUpdated", updateCartCount)
    
    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", updateCartCount)
    }
  }, [])
  const pathname = usePathname()

  const isAdmin = profile?.role === "admin" || profile?.is_admin
  const isAccountant = profile?.role === "accountant" || profile?.is_accountant
  const isManager = profile?.role === "manager"
  const isCustomer = !profile?.role || profile?.role === "user"

  const mainNavItems = [
    { 
      name: "Home", 
      href: "/", 
      icon: Utensils,
      show: isCustomer 
    },
    { 
      name: "Menu", 
      href: "/menu", 
      icon: Utensils,
      show: isCustomer 
    },
    { 
      name: "Dashboard", 
      href: isCustomer ? "/dashboard" : "/admin", 
      icon: LayoutDashboard,
      show: true 
    },
    { 
      name: "Orders", 
      href: isCustomer ? "/orders" : "/admin/orders", 
      icon: ShoppingCart,
      show: true 
    },
    { 
      name: "Products", 
      href: "/admin/products", 
      icon: Utensils,
      show: !isCustomer 
    },
    { 
      name: "Discounts", 
      href: "/admin/discounts", 
      icon: Tag,
      show: isAdmin || isAccountant || isManager
    },
  ]

  return (
      <header className="border-b border-border bg-background h-16 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left Section: Logo and Main Nav */}
        <div className="flex items-center gap-10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl font-serif text-primary-foreground font-bold">M</span>
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold leading-none">Mama Jos</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Restaurant Management</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {mainNavItems.filter(item => item.show).map(item => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-colors hover:text-red-600",
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? "text-red-600" : "text-slate-600"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Icons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {isCustomer && (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5 text-slate-600 hover:text-red-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            <InternalCommunication />
            <NotificationBell userId={user.id} />
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
            {!isCustomer && <POSTerminalToggle />}
            <ModeToggle />
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />
            <UserNav user={user} profile={profile} />
          </div>
        </div>
      </div>
    </header>
  )
}
