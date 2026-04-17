import Link from "next/link"
import { 
  Users, 
  Gift, 
  BarChart3, 
  Tag, 
  Target,
  LayoutDashboard
} from "lucide-react"

export function CRMNavigation() {
  const navItems = [
    {
      title: "Overview",
      href: "/admin/crm",
      icon: LayoutDashboard,
      description: "CRM Dashboard summary"
    },
    {
      title: "Clients",
      href: "/admin/crm/clients",
      icon: Users,
      description: "Manage customer profiles and history"
    },
    {
      title: "Loyalty Points",
      href: "/admin/crm/loyalty",
      icon: Gift,
      description: "Points settings and rewards catalog"
    },
    {
      title: "Offers",
      href: "/admin/crm/offers",
      icon: Tag,
      description: "Manage discounts and special offers"
    },
    {
      title: "Campaigns",
      href: "/admin/crm/campaigns",
      icon: Target,
      description: "Marketing strategies and automation"
    },
    {
      title: "Reports",
      href: "/admin/crm/reports",
      icon: BarChart3,
      description: "Customer analytics and loyalty reports"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <item.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
