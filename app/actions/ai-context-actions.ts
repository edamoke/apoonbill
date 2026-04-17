import { createClient } from "@/lib/supabase/server"

export async function getSystemStateDump() {
  const supabase = await createClient()
  
  // 1. Fetch Stock Levels
  const { data: stockLevels } = await supabase
    .from('inventory_items')
    .select('name, current_stock, reorder_level, unit')

  // 2. Fetch Daily Sales
  const today = new Date().toISOString().split('T')[0]
  const { data: dailyOrders } = await supabase
    .from('orders')
    .select('total, status, payment_method')
    .gte('created_at', today)

  // 3. Fetch Recent Losses/Variances
  const { data: recentVariances } = await supabase
    .from('inventory_variance')
    .select('item_name, variance_quantity, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  // 4. Active Promotions
  const { data: activeDiscounts } = await supabase
    .from('active_discounts')
    .select('name, discount_percentage')

  return {
    timestamp: new Date().toISOString(),
    stockStatus: {
      totalItems: stockLevels?.length || 0,
      lowStock: stockLevels?.filter(i => Number(i.current_stock) <= Number(i.reorder_level)) || []
    },
    financials: {
      todaySalesCount: dailyOrders?.length || 0,
      todayRevenue: dailyOrders?.reduce((acc, o) => acc + Number(o.total), 0) || 0
    },
    risks: {
      recentVariances: recentVariances || [],
      potentialLosses: dailyOrders?.filter(o => o.status === 'cancelled' || o.status === 'voided') || []
    },
    activePromotions: activeDiscounts || []
  }
}
