"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
  revalidatePath("/admin/accounting/reports/crm")
  return { success: true }
}

export async function redeemReward(rewardId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  // 1. Get reward details
  const { data: reward, error: rewardError } = await supabase
    .from("loyalty_rewards")
    .select("*, menu_items(name)")
    .eq("id", rewardId)
    .single()
  
  if (rewardError) return { success: false, error: "Reward not found" }

  // 2. Get user profile
  const { data: profile } = await supabase.from("profiles").select("loyalty_points").eq("id", user.id).single()
  
  if (!profile || profile.loyalty_points < reward.points_cost) {
    return { success: false, error: "Insufficient loyalty points" }
  }

  // 3. Start Redemption Process
  // A: Deduct points from profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ loyalty_points: profile.loyalty_points - reward.points_cost })
    .eq("id", user.id)

  if (updateError) throw updateError

  // B: Create transaction record
  await supabase.from("loyalty_transactions").insert({
    user_id: user.id,
    points_change: -reward.points_cost,
    type: 'redeem',
    notes: `Redeemed for ${reward.menu_items.name}`
  })

  // C: Create a "Zero Cost" order for the kitchen
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

  // D: Add item to order
  await supabase.from("order_items").insert({
    order_id: order.id,
    menu_item_id: reward.menu_item_id,
    quantity: 1,
    unit_price: 0
  })

  revalidatePath("/dashboard")
  return { success: true, orderId: order.id }
}
