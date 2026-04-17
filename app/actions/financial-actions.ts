"use server"

import { createClient } from "@/lib/supabase/server"

export async function getFinancialSummary() {
  const supabase = await createClient()

  // 1. Get Balances for P&L
  // Revenue (Type: revenue)
  const { data: revenueData } = await supabase
    .from("ledger_entries")
    .select("credit, chart_of_accounts!inner(type)")
    .eq("chart_of_accounts.type", "revenue")

  const totalRevenue = revenueData?.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0) || 0

  // Expenses (Type: expense)
  const { data: expenseData } = await supabase
    .from("ledger_entries")
    .select("debit, chart_of_accounts!inner(type)")
    .eq("chart_of_accounts.type", "expense")

  const totalExpenses = expenseData?.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0) || 0

  // 2. Get Asset Balances (Balance Sheet)
  const { data: assetData } = await supabase
    .from("ledger_entries")
    .select("debit, credit, chart_of_accounts!inner(type)")
    .eq("chart_of_accounts.type", "asset")

  const totalAssets = assetData?.reduce((sum, entry) => sum + (Number(entry.debit) - Number(entry.credit)), 0) || 0

  // 3. Get Recent Ledger Transactions
  const { data: recentTransactions } = await supabase
    .from("general_ledger")
    .select(`
      id,
      transaction_date,
      description,
      reference_type,
      ledger_entries (
        debit,
        credit,
        chart_of_accounts (name, code)
      )
    `)
    .order("transaction_date", { ascending: false })
    .limit(10)

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalAssets,
    recentTransactions: recentTransactions || []
  }
}

export async function getChartOfAccounts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chart_of_accounts")
    .select("*")
    .order("code")
  return data || []
}
