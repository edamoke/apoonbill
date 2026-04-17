import { CRMNavigation } from "@/components/admin/crm/crm-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Gift, BarChart3, TrendingUp } from "lucide-react"
import { getCRMStats } from "@/app/actions/crm-actions"

export default async function CRMPage() {
  const stats = await getCRMStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold italic">CRM Dashboard</h1>
        <p className="text-muted-foreground">Manage customer relationships, loyalty, and marketing.</p>
      </div>

      <CRMNavigation />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loyalty Members</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoyalty.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Customers with points balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Points Balance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPoints.toLocaleString()} pts</div>
            <p className="text-xs text-muted-foreground">Total: {stats.totalPoints.toLocaleString()} pts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaignConversion}%</div>
            <p className="text-xs text-muted-foreground">Social post approval rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers (Loyalty)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCustomers.map((customer, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                  <div>
                    <p className="font-bold text-sm uppercase">{customer.full_name || "Unknown User"}</p>
                    <p className="text-[10px] text-muted-foreground font-black">{customer.total_orders || 0} ORDERS PLACED</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{customer.loyalty_points?.toLocaleString() || 0} PTS</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentRedemptions.length > 0 ? (
                stats.recentRedemptions.map((redemption: any, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-sm uppercase">{redemption.profiles?.full_name || "Client"}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase">
                        {new Date(redemption.created_at).toLocaleDateString()} @ {new Date(redemption.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-500">-{Math.abs(redemption.points_change)} PTS</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic py-4">No recent point redemptions found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
