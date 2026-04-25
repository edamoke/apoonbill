"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, ShoppingCart, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav({ cartItemCount = 0 }: { cartItemCount?: number }) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Menu",
      href: "/menu",
      icon: UtensilsCrossed,
    },
    {
      label: "Search",
      href: "/menu?focus=search",
      icon: Search,
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      label: "Account",
      href: "/orders",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 px-4 py-2 pb-safe-offset-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0,05)] rounded-t-[1.5rem]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-all duration-300 relative group",
                isActive ? "text-red-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-2xl transition-all duration-300 active:scale-90",
                isActive ? "bg-red-50" : "bg-transparent"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-transform duration-300",
                  isActive ? "scale-110" : "group-active:scale-95"
                )} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
              
              {item.badge !== undefined && (
                <span className="absolute top-1 right-2 h-5 w-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
