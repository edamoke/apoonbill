"use server"

import { createClient } from "@/lib/supabase/server"

export type DateRange = {
  from: string
  to: string
}

export type ReportFilters = {
  startDate?: string
  endDate?: string
  outletId?: string
  categoryId?: string
  staffId?: string
  paymentMethod?: string
  status?: string
  minAmount?: number
  maxAmount?: number
}

/**
 * SALES & REVENUE REPORTS
 */

export async function getDailySalesSummary(filters?: ReportFilters) {
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select("total, status, payment_method, created_at, delivery_fee, tax_amount, outlet_id, outlets(name)")

  if (filters?.startDate) query = query.gte("created_at", filters.startDate)
  if (filters?.endDate) query = query.lte("created_at", filters.endDate)
  if (filters?.outletId && filters.outletId !== "all") query = query.eq("outlet_id", filters.outletId)
  if (filters?.paymentMethod && filters.paymentMethod !== "all") query = query.eq("payment_method", filters.paymentMethod)
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status)
  if (filters?.minAmount) query = query.gte("total", filters.minAmount)
  if (filters?.maxAmount) query = query.lte("total", filters.maxAmount)

  if (!filters?.status) {
    query = query.in("status", ["completed", "delivered", "served"])
  }

  const { data, error } = await query

  if (error) throw error

  const totalSales = data.reduce((sum, order) => sum + Number(order.total), 0)
  const totalTax = data.reduce((sum, order) => sum + Number(order.tax_amount || 0), 0)
  const netSales = totalSales - totalTax

  const split = data.reduce((acc: any, order) => {
    const method = order.payment_method || "unknown"
    acc[method] = (acc[method] || 0) + Number(order.total)
    return acc
  }, {})

  const outletSplit = data.reduce((acc: any, order) => {
    const outletName = (order.outlets as any)?.name || "Main"
    acc[outletName] = (acc[outletName] || 0) + Number(order.total)
    return acc
  }, {})

  return {
    totalSales,
    grossSales: totalSales,
    netSales,
    paymentSplit: split,
    outletSplit
  }
}

export async function getSalesByCategory(filters?: ReportFilters) {
  const supabase = await createClient()
  let query = supabase
    .from("order_items")
    .select(`
      quantity,
      unit_price,
      menu_items (
        name,
        menu_categories (
          id,
          name
        )
      ),
      orders!inner (
        created_at,
        status,
        outlet_id,
        waiter_id
      )
    `)

  if (filters?.startDate) query = query.gte("orders.created_at", filters.startDate)
  if (filters?.endDate) query = query.lte("orders.created_at", filters.endDate)
  if (filters?.outletId && filters.outletId !== "all") query = query.eq("orders.outlet_id", filters.outletId)
  if (filters?.staffId && filters.staffId !== "all") query = query.eq("orders.waiter_id", filters.staffId)
  if (filters?.categoryId && filters.categoryId !== "all") query = query.eq("menu_items.menu_categories.id", filters.categoryId)

  if (!filters?.status) {
    query = query.in("orders.status", ["completed", "delivered", "served"])
  } else if (filters.status !== "all") {
    query = query.eq("orders.status", filters.status)
  }

  const { data, error } = await query
  if (error) throw error

  const categorySales = data.reduce((acc: any, item: any) => {
    const categoryName = item.menu_items?.menu_categories?.name || "Uncategorized"
    const total = Number(item.quantity) * Number(item.unit_price)
    acc[categoryName] = (acc[categoryName] || 0) + total
    return acc
  }, {})

  return Object.entries(categorySales).map(([name, value]) => ({ name, value }))
}

export async function getSalesByItem(filters?: ReportFilters) {
  const supabase = await createClient()
  let query = supabase
    .from("order_items")
    .select(`
      quantity,
      unit_price,
      menu_items (
        name,
        menu_categories (
          id,
          name
        )
      ),
      orders!inner (
        created_at,
        status,
        outlet_id,
        waiter_id
      )
    `)

  if (filters?.startDate) query = query.gte("orders.created_at", filters.startDate)
  if (filters?.endDate) query = query.lte("orders.created_at", filters.endDate)
  if (filters?.outletId && filters.outletId !== "all") query = query.eq("orders.outlet_id", filters.outletId)
  if (filters?.staffId && filters.staffId !== "all") query = query.eq("orders.waiter_id", filters.staffId)
  if (filters?.categoryId && filters.categoryId !== "all") query = query.eq("menu_items.menu_categories.id", filters.categoryId)

  if (!filters?.status) {
    query = query.in("orders.status", ["completed", "delivered", "served"])
  } else if (filters.status !== "all") {
    query = query.eq("orders.status", filters.status)
  }

  const { data, error } = await query
  if (error) throw error

  const itemSales = data.reduce((acc: any, item: any) => {
    const itemName = item.menu_items?.name || "Unknown Item"
    if (!acc[itemName]) {
      acc[itemName] = { name: itemName, quantity: 0, revenue: 0 }
    }
    acc[itemName].quantity += Number(item.quantity)
    acc[itemName].revenue += Number(item.quantity) * Number(item.unit_price)
    return acc
  }, {})

  return Object.values(itemSales).sort((a: any, b: any) => b.revenue - a.revenue)
}

export async function getSalesByTime(range?: DateRange) {
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select("total, created_at")
    .in("status", ["completed", "delivered", "served"])

  if (range) {
    query = query.gte("created_at", range.from).lte("created_at", range.to)
  }

  const { data, error } = await query
  if (error) throw error

  const hourlySales = Array(24).fill(0).map((_, i) => ({ hour: i, revenue: 0 }))
  
  data.forEach(order => {
    const hour = new Date(order.created_at).getHours()
    hourlySales[hour].revenue += Number(order.total)
  })

  // Peak vs Off-peak (Example: Peak is 12-14 and 19-22)
  const peakHours = [12, 13, 14, 19, 20, 21, 22]
  let peakRevenue = 0
  let offPeakRevenue = 0

  hourlySales.forEach(h => {
    if (peakHours.includes(h.hour)) peakRevenue += h.revenue
    else offPeakRevenue += h.revenue
  })

  return {
    hourlySales,
    peakRevenue,
    offPeakRevenue
  }
}

/**
 * COST & PROFITABILITY REPORTS
 */

export async function getProfitabilityReport(range?: DateRange) {
  const supabase = await createClient()
  
  // Revenue from Sales
  let salesQuery = supabase
    .from("orders")
    .select("total")
    .in("status", ["completed", "delivered", "served"])

  // Costs from Ledger
  let costQuery = supabase
    .from("accounting_ledger")
    .select("amount, category")
    .eq("transaction_type", "expense")

  if (range) {
    salesQuery = salesQuery.gte("created_at", range.from).lte("created_at", range.to)
    costQuery = costQuery.gte("transaction_date", range.from).lte("transaction_date", range.to)
  }

  const [salesRes, costRes] = await Promise.all([salesQuery, costQuery])

  const totalRevenue = salesRes.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0
  const totalCost = costRes.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  const foodCost = costRes.data?.filter(e => e.category === 'supply_purchase').reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return {
    revenue: totalRevenue,
    cost: totalCost,
    grossProfit: totalRevenue - totalCost,
    margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
    foodCostPercent: totalRevenue > 0 ? (foodCost / totalRevenue) * 100 : 0
  }
}

export async function getAdvancedFinancials() {
  const supabase = await createClient()
  
  // Get monthly breakdown for last 6 months
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()

  const { data: ledger, error } = await supabase
    .from("accounting_ledger")
    .select("amount, transaction_type, transaction_date")
    .gte("transaction_date", sixMonthsAgo)

  if (error) throw error

  const monthlyData: any = {}
  ledger.forEach(entry => {
    const date = new Date(entry.transaction_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyData[key]) {
      monthlyData[key] = { revenue: 0, expenses: 0, profit: 0 }
    }
    if (entry.transaction_type === 'income') monthlyData[key].revenue += Number(entry.amount)
    else monthlyData[key].expenses += Number(entry.amount)
    monthlyData[key].profit = monthlyData[key].revenue - monthlyData[key].expenses
  })

  const sortedMonths = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]: [string, any]) => ({ month, ...data }))

  const bestMonth = [...sortedMonths].sort((a, b) => b.profit - a.profit)[0]
  const worstMonth = [...sortedMonths].sort((a, b) => a.profit - b.profit)[0]

  // Simple Prediction for next month (Average of last 3 months profit)
  const lastThreeMonths = sortedMonths.slice(-3)
  const avgProfit = lastThreeMonths.reduce((sum, m) => sum + m.profit, 0) / (lastThreeMonths.length || 1)

  return {
    monthlyTrends: sortedMonths,
    bestMonth,
    worstMonth,
    predictedProfitNextMonth: avgProfit
  }
}

/**
 * INVENTORY & WASTE REPORTS
 */

export async function getWastageReport(range?: DateRange) {
  const supabase = await createClient()
  let query = supabase
    .from("wastage_logs")
    .select(`
      quantity,
      reason,
      created_at,
      inventory_items (
        name,
        unit_cost
      )
    `)

  if (range) {
    query = query.gte("created_at", range.from).lte("created_at", range.to)
  }

  const { data, error } = await query
  if (error) throw error

  const totalLoss = data.reduce((sum, log: any) => sum + (Number(log.quantity) * Number(log.inventory_items?.unit_cost || 0)), 0)
  
  const byReason = data.reduce((acc: any, log) => {
    acc[log.reason] = (acc[log.reason] || 0) + 1
    return acc
  }, {})

  return {
    logs: data,
    totalLoss,
    byReason
  }
}

export async function getUtilityAnalytics() {
  const supabase = await createClient()
  const { data: gasUsage, error } = await supabase
    .from("utility_usage")
    .select("*")
    .eq("utility_type", "gas")
    .order("start_date", { ascending: false })

  if (error) throw error

  // Calculate efficiency: Revenue / Gas Cost
  // We'll need a way to link gas usage periods to revenue
  // For now, return raw gas data
  return gasUsage
}

export async function getStockStatus() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_items")
    .select("name, current_stock, reorder_level, unit")
    .order("name")

  if (error) throw error
  return data
}

/**
 * STAFF PERFORMANCE
 */

export async function getStaffPerformance(range?: DateRange) {
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select(`
      total,
      waiter_id,
      profiles!orders_waiter_id_fkey (
        full_name
      )
    `)
    .in("status", ["completed", "delivered", "served"])
    .not("waiter_id", "is", null)

  if (range) {
    query = query.gte("created_at", range.from).lte("created_at", range.to)
  }

  const { data, error } = await query
  if (error) throw error

  const staffStats = data.reduce((acc: any, order: any) => {
    const name = order.profiles?.full_name || "Unknown Waiter"
    if (!acc[name]) {
      acc[name] = { name, totalSales: 0, orderCount: 0 }
    }
    acc[name].totalSales += Number(order.total)
    acc[name].orderCount += 1
    return acc
  }, {})

  return Object.values(staffStats).map((s: any) => ({
    ...s,
    averageBill: s.totalSales / s.orderCount
  }))
}

/**
 * PURCHASING & SUPPLIER REPORTS
 */

export async function getSupplierBalances() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("suppliers")
    .select(`
      name,
      contact_person,
      inventory_items (
        name,
        current_stock
      )
    `)
    .order("name")

  if (error) throw error
  return data
}

/**
 * CASHIER & PAYMENT REPORTS
 */

export async function getPaymentMethodBreakdown(range?: DateRange) {
  const supabase = await createClient()
  let query = supabase
    .from("orders")
    .select("payment_method, total")
    .in("status", ["completed", "delivered", "served"])

  if (range) {
    query = query.gte("created_at", range.from).lte("created_at", range.to)
  }

  const { data, error } = await query
  if (error) throw error

  const breakdown = data.reduce((acc: any, order: any) => {
    const method = order.payment_method || "Other"
    acc[method] = (acc[method] || 0) + Number(order.total)
    return acc
  }, {})

  return Object.entries(breakdown).map(([name, value]) => ({ name, value }))
}

/**
 * KITCHEN PERFORMANCE
 */

export async function getKitchenPerformance() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("order_status_history")
    .select(`
      order_id,
      status,
      created_at,
      orders (
        id,
        created_at
      )
    `)
    .in("status", ["preparing", "ready"])
    .order("created_at", { ascending: true })

  if (error) throw error
  
  return data
}
