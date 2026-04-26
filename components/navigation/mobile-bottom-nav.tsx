"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, UtensilsCrossed, ShoppingCart, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useCart } from "@/lib/cart"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const cartItemCount = getTotalItems()
  const [isPulsing, setIsPulsing] = useState(false)
  const [lastCount, setLastCount] = useState(cartItemCount)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (cartItemCount > lastCount) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 1000)
      setLastCount(cartItemCount)
      return () => clearTimeout(timer)
    }
    setLastCount(cartItemCount)
  }, [cartItemCount, lastCount])

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
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      isCart: true,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: Search,
    },
    {
      label: "Profile",
      href: "/orders",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 px-2 py-2 pb-safe-offset-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0,1)] rounded-t-[2rem]">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          // @ts-ignore - isCart is added to navItems
          const isCart = item.isCart
          const Icon = item.icon

          return (
            <div key={item.label + index} className={cn("flex-1 flex justify-center")}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 relative group",
                  isCart ? "text-red-600" : (isActive ? "text-red-600" : "text-gray-400 hover:text-gray-600"),
                  isCart && isPulsing && "animate-pulsing-cart"
                )}
              >
                <div className={cn(
                  "p-2.5 transition-all duration-300 active:scale-90 flex items-center justify-center rounded-2xl",
                  !isCart && isActive ? "bg-red-50" : "bg-transparent",
                )}>
                  <Icon className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isCart ? "text-red-600" : (isActive ? "scale-110" : "group-active:scale-95"),
                    isCart && isPulsing && "animate-pulse"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider font-bold",
                  isCart ? "text-red-600" : ""
                )}>
                  {item.label}
                </span>
                
                {isMounted && item.badge !== undefined && (
                  <span className={cn(
                    "absolute h-5 w-5 text-[10px] font-bold rounded-full flex items-center justify-center border-2 animate-in zoom-in shadow-sm",
                    "top-0 right-1 bg-red-600 text-white border-white"
                  )}>
                    {item.badge}
                  </span>
                )}

                {isActive && !isCart && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />
                )}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
