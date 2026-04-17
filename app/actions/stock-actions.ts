"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function captureStockSnapshot(type: 'day_start' | 'day_end' | 'manual', notes?: string) {
  const supabase = await createClient()
  
  // 1. Get all current inventory items
  const { data: items, error: fetchError } = await supabase
    .from("inventory_items")
    .select("id, current_stock, unit_cost")
  
  if (fetchError) throw fetchError
  
  // 2. Create the snapshot record
  const { data: snapshot, error: snapshotError } = await supabase
    .from("stock_snapshots")
    .insert({
      snapshot_type: type,
      notes,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single()
  
  if (snapshotError) throw snapshotError
  
  // 3. Create the snapshot items
  const snapshotItems = items.map(item => ({
    snapshot_id: snapshot.id,
    inventory_item_id: item.id,
    quantity: item.current_stock,
    unit_cost: item.unit_cost
  }))
  
  const { error: itemsError } = await supabase
    .from("stock_snapshot_items")
    .insert(snapshotItems)
  
  if (itemsError) throw itemsError
  
  revalidatePath("/admin/accounting/reports/stock-analysis")
  return snapshot
}

export async function getStockVarianceReport(date: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("stock_variance_analysis")
    .select("*")
    .eq("snapshot_date", date)
  
  if (error) throw error
  return data
}

export async function getAvailableSnapshotDates() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stock_snapshots")
    .select("snapshot_date")
    .eq("snapshot_type", "day_start")
    .order("snapshot_date", { ascending: false })
  
  if (error) throw error
  return Array.from(new Set(data.map(d => d.snapshot_date)))
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
