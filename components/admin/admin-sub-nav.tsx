"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "CATEGORIES", href: "/admin/categories" },
  { name: "INVENTORY", href: "/admin/inventory" },
  { name: "USERS", href: "/admin/users" },
  { name: "HRM", href: "/admin/hrm" },
  { name: "SUPPLIERS", href: "/admin/suppliers" },
  { name: "ACCOUNTING", href: "/admin/accounting" },
]

export function AdminSubNav() {
  const pathname = usePathname()

  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center px-4 overflow-x-auto no-scrollbar">
        <nav className="flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-xs font-bold transition-colors hover:text-primary relative py-4",
                  isActive 
                    ? "text-red-600 border-b-2 border-red-600" 
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
