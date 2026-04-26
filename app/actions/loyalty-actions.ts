"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getLoyaltyConfig() {
  const supabase = await createClient()
  const { data } = await supabase.from("site_settings").select("value").eq("key", "loyalty_config").single()
  return data?.value || { points_per_100_kes: 10, social_bonus_points: 50, min_spend_for_points: 500 }
}

export async function updateLoyaltyConfig(config: any) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from("site_settings").upsert({ key: "loyalty_config", value: config })
  if (error) throw error
  revalidatePath("/admin/crm/loyalty")
  return { success: true }
}

export async function awardPointsForPurchase(userId: string, amount: number, orderId?: string) {
  const supabase = await createAdminClient()
  const config = await getLoyaltyConfig()

  if (amount < (config.min_spend_for_points || 0)) return { success: false, reason: "Below min spend" }

  const pointsToAward = Math.floor((amount / 100) * config.points_per_100_kes)
  
  if (pointsToAward <= 0) return { success: false, reason: "Zero points" }

  // Update profile
  const { data: profile } = await supabase.from("profiles").select("loyalty_points, total_orders").eq("id", userId).single()
  const newPoints = (profile?.loyalty_points || 0) + pointsToAward
  const newOrders = (profile?.total_orders || 0) + 1

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ loyalty_points: newPoints, total_orders: newOrders })
    .eq("id", userId)

  if (profileError) throw profileError

  // Log transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    points_change: pointsToAward,
    type: 'earn',
    description: `Earned from purchase of KSh ${amount.toLocaleString()}`,
    order_id: orderId
  })

  return { success: true, pointsAwarded: pointsToAward }
}

export async function submitSocialPost(platform: string, postUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("social_posts").insert({
    user_id: user.id,
    platform,
    post_url: postUrl,
    status: 'pending'
  })

  if (error) throw error
  return { success: true }
}

export async function approveSocialPost(postId: string) {
  const supabase = await createAdminClient()
  const config = await getLoyaltyConfig()
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", postId)
    .single()

  if (postError || post.status !== 'pending') throw new Error("Post not found or already processed")

  // Award points
  const { data: profile } = await supabase.from("profiles").select("loyalty_points").eq("id", post.user_id).single()
  const newPoints = (profile?.loyalty_points || 0) + config.social_bonus_points

  await supabase.from("profiles").update({ loyalty_points: newPoints }).eq("id", post.user_id)

  // Update post status
  await supabase.from("social_posts").update({
    status: 'approved',
    points_awarded: config.social_bonus_points,
    reviewed_by: adminUser?.id,
    reviewed_at: new Date().toISOString()
  }).eq("id", postId)

  // Log transaction
  await supabase.from("loyalty_transactions").insert({
    user_id: post.user_id,
    points_change: config.social_bonus_points,
    type: 'bonus',
    description: `Social media bonus (${post.platform})`
  })

  revalidatePath("/admin/crm/loyalty")
  return { success: true }
}

export async function getLoyaltyRewards() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .select(`
      *,
      menu_items (
        name,
        price,
        image_url
      )
    `)
    .eq("is_available", true)
  
  if (error) throw error
  return data
}

export async function addLoyaltyReward(menuItemId: string, pointsCost: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("loyalty_rewards")
    .insert({ menu_item_id: menuItemId, points_cost: pointsCost })
    .select()

  if (error) throw error
  revalidatePath("/admin/crm/loyalty")
  return { success: true }
}

export async function redeemReward(rewardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: reward, error: rewardError } = await supabase
    .from("loyalty_rewards")
    .select("*, menu_items(name)")
    .eq("id", rewardId)
    .single()
  
  if (rewardError) return { success: false, error: "Reward not found" }

  const { data: profile } = await supabase.from("profiles").select("loyalty_points").eq("id", user.id).single()
  if (!profile || profile.loyalty_points < reward.points_cost) {
    return { success: false, error: "Insufficient loyalty points" }
  }

  await supabase.from("profiles").update({ loyalty_points: profile.loyalty_points - reward.points_cost }).eq("id", user.id)

  await supabase.from("loyalty_transactions").insert({
    user_id: user.id,
    points_change: -reward.points_cost,
    type: 'redeem',
    description: `Redeemed for ${reward.menu_items.name}`
  })

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total: 0,
      status: 'confirmed',
      order_type: 'online',
      payment_method: 'points',
      payment_status: 'paid',
      customer_name: user.user_metadata?.full_name || 'Loyalty Member',
      delivery_address: 'Loyalty Reward (Free Gift)'
    })
    .select()
    .single()

  if (orderError) throw orderError

  await supabase.from("order_items").insert({
    order_id: order.id,
    menu_item_id: reward.menu_item_id,
    quantity: 1,
    unit_price: 0
  })

  revalidatePath("/dashboard")
  return { success: true, orderId: order.id }
}
