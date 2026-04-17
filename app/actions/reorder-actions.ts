"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createManualSupplyOrder(
  supplier_id: string,
  items: { inventory_item_id: string; quantity: number; unit_cost: number }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const total_amount = items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);

  // 1. Create the Supply Order
  const { data: order, error: orderError } = await supabase
    .from("supply_orders")
    .insert([{
      supplier_id,
      created_by: user.id,
      total_amount,
      status: "pending"
    }])
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  // 2. Create the Supply Order Items
  const orderItems = items.map(item => ({
    supply_order_id: order.id,
    inventory_item_id: item.inventory_item_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost
  }));

  const { error: itemsError } = await supabase
    .from("supply_order_items")
    .insert(orderItems);

  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/admin/supply-chain");
  revalidatePath("/admin/suppliers/orders");
  
  return order;
}

export async function getInventoryAlerts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_alerts")
    .select("*, inventory_items(name, current_stock, unit)")
    .eq("is_resolved", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function resolveInventoryAlert(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_alerts")
    .update({ is_resolved: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
