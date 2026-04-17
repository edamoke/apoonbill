"use server"

import { createClient } from "@/lib/supabase/server"

export async function getFinancialSummary() {
  try {
    const supabase = await createClient()
    
    // Get total income
    const { data: incomeData } = await supabase
      .from("accounting_ledger")
      .select("amount")
      .eq("transaction_type", "income")

    // Get total expense
    const { data: expenseData } = await supabase
      .from("accounting_ledger")
      .select("amount")
      .eq("transaction_type", "expense")

    const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    const totalExpense = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
    
    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getLedgerEntries() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("accounting_ledger")
      .select("*")
      .order("transaction_date", { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
