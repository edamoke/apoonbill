"use client"

import { UserNav } from "@/components/auth/user-nav"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { NotificationBell } from "@/components/navigation/notification-bell"
import { ModeToggle } from "@/components/theme-toggle"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingCart, Utensils, Bike, ChefHat, Wallet } from "lucide-react"

interface StaffHeaderProps {
  user: User
  profile: any
}

export function StaffHeader({ user, profile }: StaffHeaderProps) {
  const pathname = usePathname()

  const role = profile?.role
  const isAdmin = profile?.is_admin || role === "admin"
  const isChef = role === "chef"
  const isRider = role === "rider" || role === "waiter"
  const isAccountant = role === "accountant" || profile?.is_accountant

  const navItems = [
    { 
      name: "Dashboard", 
      href: isChef ? "/chef" : isRider ? "/rider" : isAccountant ? "/accountant" : "/dashboard", 
      icon: LayoutDashboard,
      show: true 
    },
    { 
      name: "Orders", 
      href: isChef ? "/chef" : isRider ? "/rider" : "/orders", 
      icon: ShoppingCart,
      show: !isAccountant 
    },
    { 
      name: "Products", 
      href: "/menu", 
      icon: Utensils,
      show: isChef || isAdmin
    },
    { 
      name: "Accounting", 
      href: "/accountant", 
      icon: Wallet,
      show: isAccountant || isAdmin
    },
  ]

  return (
    <header className="border-b border-border bg-background h-16 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Left Section: Logo and Main Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-1.5 rounded-sm font-black text-xs leading-none">S&G</div>
            <span className="font-black tracking-tight text-red-600 text-lg uppercase leading-none">STARS & GARTERS</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.filter(item => item.show).map(item => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-colors hover:text-red-600",
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "text-red-600" : "text-slate-600"
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
            <NotificationBell userId={user.id} />
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />
            <ModeToggle />
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />
            <UserNav user={user} profile={profile} />
          </div>
        </div>
      </div>
    </header>
  )
}
