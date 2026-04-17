import { createClient } from "@/lib/supabase/server"

export async function getCRMStats() {
  const supabase = await createClient()

  // 1. Total Clients (all users with role 'user' or default)
  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .or("role.eq.user,role.is.null")

  // 2. Active Loyalty Members (users with > 0 points)
  const { count: activeLoyalty } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("loyalty_points", 0)

  // 3. Average Points Balance
  const { data: pointsData } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .gt("loyalty_points", 0)
  
  const avgPoints = pointsData?.length 
    ? Math.round(pointsData.reduce((acc, curr) => acc + (curr.loyalty_points || 0), 0) / pointsData.length) 
    : 0
  
  const totalPoints = pointsData?.reduce((acc, curr) => acc + (curr.loyalty_points || 0), 0) || 0

  // 4. Campaign Data (Real from social_posts and discount usage)
  const { count: totalSocialPosts } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true })

  const { count: approvedSocialPosts } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const campaignConversion = totalSocialPosts ? Math.round((approvedSocialPosts || 0) / totalSocialPosts * 100) : 0

  // 5. Top Customers
  const { data: topCustomers } = await supabase
    .from("profiles")
    .select("full_name, loyalty_points, total_orders")
    .gt("loyalty_points", 0)
    .order("loyalty_points", { ascending: false })
    .limit(5)

  // 6. Recent Redemptions
  const { data: recentRedemptions } = await supabase
    .from("loyalty_transactions")
    .select(`
      id,
      points_change,
      created_at,
      profiles (full_name)
    `)
    .eq("type", "redeem")
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    totalClients: totalClients || 0,
    activeLoyalty: activeLoyalty || 0,
    avgPoints,
    totalPoints,
    campaignConversion,
    topCustomers: topCustomers || [],
    recentRedemptions: recentRedemptions || []
  }
}
