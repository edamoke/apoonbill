import { createClient } from "@/lib/supabase/server"

export async function getSystemStateDump() {
  const supabase = await createClient()
  
  // 1. Fetch Stock Levels & Supply Chain
  const { data: stockLevels } = await supabase
    .from('inventory_items')
    .select('name, current_stock, reorder_level, unit')

  const { data: pendingSupplies } = await supabase
    .from('supply_orders')
    .select('id, status, total_amount, expected_delivery_date')
    .eq('status', 'pending')

  // 2. CRM & Business Leads
  const { data: hotLeads } = await supabase
    .from('business_leads')
    .select('id, company_name, contact_person, status, estimated_value, interest_level')
    .in('status', ['new', 'contacted', 'qualified'])
    .order('estimated_value', { ascending: false })
    .limit(10)

  const { data: recentCampaigns } = await supabase
    .from('crm_campaigns')
    .select('name, status, type, start_date, end_date')
    .eq('status', 'active')

  // 3. Financials & Sales
  const today = new Date().toISOString().split('T')[0]
  const { data: dailyOrders } = await supabase
    .from('orders')
    .select('total, status, payment_method')
    .gte('created_at', today)

  // 4. HRM & Operations
  const { data: activeStaff } = await supabase
    .from('staff_shifts')
    .select('id, staff_name, role, status')
    .eq('status', 'active')

  return {
    timestamp: new Date().toISOString(),
    growth: {
      leads: {
        hotLeadsCount: hotLeads?.length || 0,
        topLeads: hotLeads || [],
        pipelineValue: hotLeads?.reduce((acc, l) => acc + (Number(l.estimated_value) || 0), 0) || 0
      },
      crm: {
        activeCampaigns: recentCampaigns || []
      }
    },
    operations: {
      supplyChain: {
        lowStockItems: stockLevels?.filter(i => Number(i.current_stock) <= Number(i.reorder_level)) || [],
        pendingSuppliesCount: pendingSupplies?.length || 0,
        upcomingDeliveries: pendingSupplies || []
      },
      staffing: {
        activeStaffCount: activeStaff?.length || 0
      }
    },
    financials: {
      todaySalesCount: dailyOrders?.length || 0,
      todayRevenue: dailyOrders?.reduce((acc, o) => acc + Number(o.total), 0) || 0,
      cancelledOrders: dailyOrders?.filter(o => o.status === 'cancelled').length || 0
    }
  }
}
