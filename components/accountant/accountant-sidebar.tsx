"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Package, 
  FileText, 
  Settings,
  CreditCard,
  History,
  TrendingUp,
  AlertCircle
} from "lucide-react"

export function AccountantSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/accountant",
      icon: LayoutDashboard
    },
    {
      title: "Order Approval",
      href: "/accountant#approval",
      icon: Receipt
    },
    {
      title: "Financial Reports",
      href: "/accountant/reports/sales",
      icon: BarChart3
    },
    {
      title: "Inventory Variance",
      href: "/accountant/reports/stock-analysis",
      icon: AlertCircle
    },
    {
      title: "Supplier Payments",
      href: "/accountant/suppliers/payments",
      icon: CreditCard
    },
    {
      title: "Payroll & HRM",
      href: "/accountant/hrm",
      icon: FileText
    },
    {
      title: "Profit & Loss",
      href: "/accountant/reports/pnl",
      icon: TrendingUp
    },
    {
      title: "Transaction History",
      href: "/accountant/orders",
      icon: History
    },
    {
      title: "Order Flow Canvas",
      href: "/accountant/orders?view=canvas",
      icon: LayoutDashboard
    },
    {
      title: "POS Settings",
      href: "/accountant/settings/pos",
      icon: Settings
    }
  ]

  return (
    <div className="w-64 border-r bg-card h-screen sticky top-0 hidden md:flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-serif font-bold text-primary italic">Finance Portal</h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">mamaJos Accounting</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"
              )} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="p-3 rounded-xl bg-background border border-border shadow-sm">
           <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Status</p>
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold">Secure Ledger Active</span>
           </div>
        </div>
      </div>
    </div>
  )
}
