"use server";

import { createClient, validateRole } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createSupplier(formData: FormData) {
  await validateRole(['admin', 'staff']);
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const category = formData.get("category") as string;
  const address = formData.get("address") as string;

  const { error } = await supabase.from("suppliers").insert([
    { name, contact_person, email, phone, category, address },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers");
}

export async function updateSupplier(id: string, formData: FormData) {
  await validateRole(['admin', 'staff']);
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const category = formData.get("category") as string;
  const address = formData.get("address") as string;

  const { error } = await supabase
    .from("suppliers")
    .update({ name, contact_person, email, phone, category, address })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers");
}

export async function deleteSupplier(id: string) {
  await validateRole(['admin', 'staff']);
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers");
}

export async function deleteSuppliers(ids: string[]) {
  await validateRole(['admin', 'staff']);
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers");
}

export async function getSupplyOrders() {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supply_orders")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplyOrderWithItems(id: string) {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supply_orders")
    .select("*, suppliers(name), supply_order_items(*, inventory_items(name, unit))")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSupplyOrderStatus(id: string, status: string, failure_reason?: string, delivery_weight?: number, invoice_number?: string) {
  await validateRole(['admin', 'staff']);
  const supabase = await createClient();
  const updateData: any = { status, updated_at: new Date().toISOString() };
  
  if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString();
    if (delivery_weight !== undefined) updateData.delivery_weight = delivery_weight;
    if (invoice_number) updateData.invoice_number = invoice_number;
  }
  
  if (status === 'failed' && failure_reason) {
    updateData.failure_reason = failure_reason;
  }

  const { error } = await supabase
    .from("supply_orders")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers/orders");
}

export async function getSupplierPerformance(supplierId: string) {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supply_orders")
    .select("status, delivery_weight, ordered_weight, weight_discrepancy, created_at")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplierPriceHistory(supplierId: string, inventoryItemId?: string) {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  let query = supabase
    .from("supplier_price_history")
    .select("*, inventory_items(name, unit)")
    .eq("supplier_id", supplierId)
    .order("recorded_at", { ascending: false });

  if (inventoryItemId) {
    query = query.eq("inventory_item_id", inventoryItemId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplierPerformanceStats() {
  await validateRole(['admin', 'staff', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_supplier_performance_stats');
  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplyReportByTimeframe(timeframe: string, startDate?: string, endDate?: string) {
  await validateRole(['admin', 'staff', 'accountant', 'chef']);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_supply_report_by_timeframe', {
    p_timeframe: timeframe,
    p_start_date: startDate,
    p_end_date: endDate
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductWeightReport(inventoryItemId: string, timeframe: string, startDate?: string, endDate?: string) {
  await validateRole(['admin', 'staff', 'accountant', 'chef']);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_product_weight_report', {
    p_inventory_item_id: inventoryItemId,
    p_timeframe: timeframe,
    p_start_date: startDate,
    p_end_date: endDate
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getInventoryItems() {
  await validateRole(['admin', 'staff', 'chef']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getInventoryItemDetail(id: string) {
  await validateRole(['admin', 'staff', 'chef', 'accountant']);
  const supabase = await createClient();
  
  // Get item info
  const { data: item, error: itemError } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .single();

  if (itemError) throw new Error(itemError.message);

  // Get supplier info separately
  let supplier = null;
  if (item.supplier_id) {
    const { data: supData } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", item.supplier_id)
      .single();
    supplier = supData;
  }

  // Get last stock update (from supply orders)
  const { data: lastUpdate } = await supabase
    .from("supply_order_items")
    .select("*, supply_orders(delivered_at, status)")
    .eq("inventory_item_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get recent supply requests
  const { data: recentRequests } = await supabase
    .from("supply_order_items")
    .select("*, supply_orders(*)")
    .eq("inventory_item_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    item: {
      ...item,
      suppliers: supplier
    },
    lastUpdate,
    recentRequests: recentRequests || []
  };
}

export async function getSupplierPayments() {
  await validateRole(['admin', 'accountant']);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_payments")
    .select("*, suppliers(name), supply_orders(status)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function processSupplierPayment(id: string, paymentData: {
  status: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}) {
  await validateRole(['admin', 'accountant']);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const updateData: any = {
    ...paymentData,
    updated_at: new Date().toISOString()
  };

  if (paymentData.status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  }

  if (paymentData.status === 'approved') {
    updateData.approved_at = new Date().toISOString();
    updateData.approved_by = user?.id;
  }

  const { error } = await supabase
    .from("supplier_payments")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/suppliers/payments");
}
