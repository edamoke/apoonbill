"use server"

import { createClient } from "@/lib/supabase/server"

export async function checkSystemAnomalies() {
  const supabase = await createClient()
  const alerts = []

  // 1. CRM/Leads Anomaly: High value leads with no activity
  const { data: stagnantLeads } = await supabase
    .from('business_leads')
    .select('company_name, estimated_value')
    .eq('status', 'new')
    .gt('estimated_value', 200000)

  if (stagnantLeads && stagnantLeads.length > 0) {
    alerts.push({
      type: 'growth',
      severity: 'medium',
      message: `${stagnantLeads.length} high-value leads are stagnant in 'New' status.`,
      action_hint: 'Draft follow-up'
    })
  }

  // 2. Supply Chain Anomaly: Low stock with no pending supply orders
  const { data: lowStock } = await supabase
    .from('inventory_items')
    .select('name, current_stock, reorder_level')

  const itemsAtRisk = lowStock?.filter(i => Number(i.current_stock) <= Number(i.reorder_level)) || []
  
  if (itemsAtRisk.length > 0) {
      const { data: pendingOrders } = await supabase
        .from('supply_orders')
        .select('id')
        .eq('status', 'pending')

      if (!pendingOrders || pendingOrders.length === 0) {
        alerts.push({
          type: 'operations',
          severity: 'high',
          message: `${itemsAtRisk.length} items are low on stock with no pending supply orders.`,
          action_hint: 'Generate supply draft'
        })
      }
  }

  // 3. Financial Anomaly: High cancellation rate
  const today = new Date().toISOString().split('T')[0]
  const { data: orders } = await supabase
    .from('orders')
    .select('status')
    .gte('created_at', today)

  const cancelled = orders?.filter(o => o.status === 'cancelled').length || 0
  const total = orders?.length || 0

  if (total > 5 && (cancelled / total) > 0.15) {
    alerts.push({
      type: 'finance',
      severity: 'high',
      message: `Abnormal cancellation rate detected (${Math.round((cancelled/total)*100)}%).`,
      action_hint: 'Review kitchen logs'
    })
  }

  return alerts
}
