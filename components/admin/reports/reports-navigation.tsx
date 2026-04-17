"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  Sun, 
  Moon,
  PieChart,
  BarChart3,
  Flame,
  Star,
  ClipboardList
} from "lucide-react"
import Link from "next/link"

const reports = [
  { title: "Daily Sales Report", icon: ShoppingCart, color: "text-purple-500", href: "/admin/accounting/reports/sales" },
  { title: "Daily Profit Report", icon: TrendingUp, color: "text-green-500", href: "/admin/accounting/reports/profit" },
  { title: "Daily Stock Report", icon: Package, color: "text-orange-500", href: "/admin/accounting/reports/stock" },
  { title: "Day Start/End Stock Analysis", icon: ClipboardList, color: "text-red-500", href: "/admin/accounting/reports/stock-analysis" },
  { title: "Daily Staff Report", icon: Users, color: "text-pink-500", href: "/admin/accounting/reports/staff" },
  { title: "Purchasing Report", icon: ShoppingCart, color: "text-blue-500", href: "/admin/accounting/reports/purchasing" },
  { title: "Payments Report", icon: PieChart, color: "text-cyan-500", href: "/admin/accounting/reports/payments" },
  { title: "Kitchen Performance", icon: Flame, color: "text-orange-600", href: "/admin/accounting/reports/kitchen" },
  { title: "Customer CRM", icon: Star, color: "text-yellow-500", href: "/admin/accounting/reports/crm" },
  { title: "Daily Expense Report", icon: TrendingDown, color: "text-red-500", href: "/admin/accounting/reports/expense" },
  { title: "Profit & Loss Report", icon: FileText, color: "text-blue-500", href: "/admin/accounting/reports/pnl" },
  { title: "New Day Shift Report", icon: Sun, color: "text-yellow-500", href: "/admin/accounting/reports/shift-new" },
  { title: "End Day Shift Report", icon: Moon, color: "text-indigo-500", href: "/admin/accounting/reports/shift-end" },
  { title: "Online vs Visit Sales", icon: PieChart, color: "text-cyan-500", href: "/admin/accounting/reports/sales-compare" },
  { title: "Comprehensive Analytics", icon: BarChart3, color: "text-teal-500", href: "/admin/accounting/reports/analytics" },
]

export function ReportsNavigation() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {reports.map((report) => (
        <Link key={report.title} href={report.href}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <report.icon className={`w-8 h-8 ${report.color} mb-2`} />
              <span className="text-sm font-medium">{report.title}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
