const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyWorkflows() {
  console.log("🚀 Verifying Automated & Manual Ordering Workflows...");

  // 1. Check if inventory_alerts table exists and has data
  const { data: alerts, error: alertsError } = await supabase
    .from("inventory_alerts")
    .select("*, inventory_items(name)");
  
  if (alertsError) {
    console.error("❌ Error fetching alerts:", alertsError);
  } else {
    console.log(`✅ Found ${alerts?.length || 0} inventory alerts.`);
  }

  // 2. Trigger a low stock alert manually for testing
  // Get an item first
  const { data: items } = await supabase.from("inventory_items").select("*").limit(1);
  if (items && items.length > 0) {
    const item = items[0];
    console.log(`📝 Testing trigger for item: ${item.name}`);
    
    // Set stock to below reorder level
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({ current_stock: item.reorder_level - 1 })
      .eq("id", item.id);

    if (updateError) {
      console.error("❌ Error updating stock:", updateError);
    } else {
      console.log("✅ Stock updated to below reorder level.");
      
      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: newAlerts } = await supabase
        .from("inventory_alerts")
        .select("*")
        .eq("inventory_item_id", item.id)
        .eq("is_resolved", false);
      
      if (newAlerts && newAlerts.length > 0) {
        console.log("✅ Trigger works! Low stock alert created.");
      } else {
        console.log("⚠️ No alert created. Check if trigger 087 is applied.");
      }
    }
  }

  // 3. Verify Supply Orders
  const { data: orders, error: ordersError } = await supabase
    .from("supply_orders")
    .select("*, supply_order_items(*)");
  
  if (ordersError) {
    console.error("❌ Error fetching supply orders:", ordersError);
  } else {
    console.log(`✅ Found ${orders?.length || 0} supply orders.`);
  }

  console.log("🏁 Verification complete.");
}

verifyWorkflows();
