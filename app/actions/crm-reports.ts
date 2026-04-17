"use server"

import { createClient } from "@/lib/supabase/server"

export async function getCRMReports() {
  const supabase = await createClient()

  // 1. Signups data (last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const reports = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    const { count: signups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${dateStr}T00:00:00`)
      .lte("created_at", `${dateStr}T23:59:59`)
      .or("role.eq.user,role.is.null")

    const { count: redemptions } = await supabase
      .from("loyalty_transactions")
      .select("*", { count: "exact", head: true })
      .eq("type", "redeem")
      .gte("created_at", `${dateStr}T00:00:00`)
      .lte("created_at", `${dateStr}T23:59:59`)

    reports.push({
      name: days[d.getDay()],
      signups: signups || 0,
      redemptions: redemptions || 0
    })
  }

  // 2. ROI Metrics
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total, user_id")
    .in("payment_status", ["completed", "paid"])

  const loyaltyUserIds = new Set()
  const { data: loyaltyUsers } = await supabase.from("profiles").select("id").gt("loyalty_points", 0)
  loyaltyUsers?.forEach(u => loyaltyUserIds.add(u.id))

  const loyaltyRevenue = revenueData
    ?.filter(o => loyaltyUserIds.has(o.user_id))
    ?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0
  
  const avgLoyaltyOrder = revenueData?.filter(o => loyaltyUserIds.has(o.user_id)).length 
    ? loyaltyRevenue / revenueData.filter(o => loyaltyUserIds.has(o.user_id)).length
    : 0

  return {
    graphData: reports,
    loyaltyRevenue,
    avgLoyaltyOrder
  }
}
