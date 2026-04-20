"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Settings,
  Menu as MenuIcon,
  Heart,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Calculator } from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Browse Menu",
    href: "/dashboard/menu",
    icon: MenuIcon,
  },
  {
    title: "My Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "My Bookings",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
  {
    title: "Profile Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const erpItems = [
  {
    title: "Accounting",
    href: "/admin/accounting",
    icon: Calculator,
    roles: ["admin", "accountant"],
  },
]

export function CustomerSidebar({ profile }: { profile?: any }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden fixed bottom-6 right-6 z-[60]">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground border-4 border-background"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[55] w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0 md:w-64 md:h-[calc(100vh-65px)] md:sticky md:top-[65px] md:bg-card/50 md:backdrop-blur-sm",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full py-6 md:py-4">
          <div className="px-6 mb-6 md:hidden">
            <h2 className="text-xl font-serif font-bold">thespoonbill</h2>
            <p className="text-xs text-muted-foreground">Customer Dashboard</p>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 text-base md:text-sm font-medium rounded-xl md:rounded-md transition-all",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02] md:scale-100"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                {item.title}
              </Link>
            ))}

            {/* ERP Access Links */}
            {erpItems.map((item) => {
              const hasAccess = item.roles.includes(profile?.role || "");
              if (!hasAccess) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 text-base md:text-sm font-medium rounded-xl md:rounded-md transition-all mt-4 border-t pt-4 md:mt-2 md:pt-2",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02] md:scale-100"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
