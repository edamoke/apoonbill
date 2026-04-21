"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FolderTree,
  ChefHat,
  Bike,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  Ticket,
  Globe,
  Truck,
  Heart,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UniversalMenuSearch } from "./universal-menu-search"

interface AdminSidebarProps {
  userRole: string
  isAdmin?: boolean
  isChef?: boolean
  isRider?: boolean
  isAccountant?: boolean
}

export function AdminSidebar({ userRole, isAdmin, isChef, isRider, isAccountant }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/sign-in")
  }

  // Define navigation based on roles
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["admin", "accountant", "chef", "rider"],
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      roles: ["admin", "accountant", "chef", "rider"],
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      roles: ["admin", "accountant"],
    },
    {
      name: "Business Leads",
      href: "/admin/business-leads",
      icon: Users,
      roles: ["admin", "accountant"],
    },
    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: Package,
      roles: ["admin", "accountant"],
    },
    {
      name: "Supply Chain",
      href: "/admin/supply-chain",
      icon: Truck,
      roles: ["admin", "accountant"],
    },
    {
      name: "Events",
      href: "/admin/events",
      icon: Ticket,
      roles: ["admin"],
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: Calendar,
      roles: ["admin"],
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      roles: ["admin"],
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "HRM",
      href: "/admin/hrm",
      icon: Users,
      roles: ["admin", "hrm"],
    },
    {
      name: "Kitchen",
      href: "/admin/kitchen",
      icon: ChefHat,
      roles: ["chef"],
    },
    {
      name: "Deliveries",
      href: "/admin/deliveries",
      icon: Bike,
      roles: ["rider"],
    },
    {
      name: "Accounting",
      href: "/admin/accounting",
      icon: Calculator,
      roles: ["admin", "accountant"],
    },
    {
      name: "Outside Catering",
      href: "/admin/catering",
      icon: Truck,
      roles: ["admin", "manager"],
    },
    {
      name: "CRM",
      href: "/admin/crm",
      icon: Heart,
      roles: ["admin"],
    },
    {
      name: "CMS",
      href: "/admin/cms",
      icon: Globe,
      roles: ["admin"],
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      roles: ["admin", "accountant", "chef", "rider"],
    },
  ]

  // Filter navigation based on user roles
  const filteredNavigation = navigation.filter((item) => {
    if (isAdmin) return item.roles.includes("admin")
    if (isAccountant) return item.roles.includes("accountant")
    if (userRole === "hrm") return item.roles.includes("hrm")
    if (isChef) return item.roles.includes("chef")
    if (isRider) return item.roles.includes("rider")
    return false
  })

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border space-y-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-2xl font-serif text-primary-foreground">S</span>
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold">The Spoonbill</h1>
                <p className="text-xs text-muted-foreground capitalize">{userRole} Portal</p>
              </div>
            </Link>
            <UniversalMenuSearch />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
