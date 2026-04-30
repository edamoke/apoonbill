"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSupplyChainForecast() {
  const supabase = await createClient()
  
  // 1. Get Inventory
  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('id, name, current_stock, reorder_level, unit')

  // 2. Get High-Value Business Leads (Future Demand)
  const { data: leads } = await supabase
    .from('business_leads')
    .select('id, estimated_value, interest_level')
    .eq('status', 'qualified')

  // 3. Simple heuristic: High-value qualified leads increase projected demand by 25%
  const multiplier = leads && leads.length > 0 ? 1.25 : 1.0
  
  const forecasts = inventory?.map(item => {
    const isAtRisk = Number(item.current_stock) < (Number(item.reorder_level) * multiplier)
    return {
      ...item,
      projected_demand_status: isAtRisk ? 'at_risk' : 'stable',
      lead_impact_factor: multiplier
    }
  })

  return forecasts?.filter(f => f.projected_demand_status === 'at_risk') || []
}

export async function getLeadInsights() {
  const supabase = await createClient()
  
  const { data: leads } = await supabase
    .from('business_leads')
    .select('*')
    .order('created_at', { ascending: false })

  // Intelligence: Identify leads with high value but low activity
  const stagnantLeads = leads?.filter(l => 
    Number(l.estimated_value) > 100000 && 
    (l.status === 'new' || l.status === 'contacted')
  )

  return {
    stagnantHighValue: stagnantLeads || [],
    totalPipelineValue: leads?.reduce((acc, l) => acc + (Number(l.estimated_value) || 0), 0) || 0
  }
}
