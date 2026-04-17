import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, {
  ssl: "require",
});

async function verifyWorkflow() {
  try {
    console.log("🔍 Verifying Supply Chain & Recipe Engine Workflow...");

    // 1. Get a test inventory item
    const [item] = await sql`
      SELECT * FROM public.inventory_items 
      WHERE sku = 'MT-BEEF-01' 
      LIMIT 1
    `;

    if (!item) {
      console.error("❌ Test item (MT-BEEF-01) not found. Run seed script first.");
      return;
    }

    console.log(`📊 Initial Stock for ${item.name}: ${item.current_stock} ${item.unit}`);

    // 2. Simulate a Supply Order
    const [supplier] = await sql`SELECT id FROM public.suppliers LIMIT 1`;
    const [user] = await sql`SELECT id FROM auth.users LIMIT 1`;

    if (!supplier || !user) {
      console.error("❌ Supplier or User not found.");
      return;
    }

    console.log("🛒 Creating Supply Order for 20 units...");
    const [supplyOrder] = await sql`
      INSERT INTO public.supply_orders (supplier_id, created_by, status, total_amount)
      VALUES (${supplier.id}, ${user.id}, 'pending', 12000)
      RETURNING id
    `;

    await sql`
      INSERT INTO public.supply_order_items (supply_order_id, inventory_item_id, quantity, unit_cost)
      VALUES (${supplyOrder.id}, ${item.id}, 20, 600)
    `;

    // 3. Deliver the Supply Order (Triggers stock increase)
    console.log("🚚 Marking Supply Order as DELIVERED...");
    await sql`
      UPDATE public.supply_orders 
      SET status = 'delivered' 
      WHERE id = ${supplyOrder.id}
    `;

    const [afterPurchase] = await sql`
      SELECT current_stock FROM public.inventory_items WHERE id = ${item.id}
    `;
    console.log(`✅ Stock after purchase: ${afterPurchase.current_stock} ${item.unit} (Expected increase by 10)`);

    // 4. Find a Menu Item that uses this ingredient
    const [recipe] = await sql`
      SELECT r.*, mi.name as menu_item_name 
      FROM public.recipes r
      JOIN public.menu_items mi ON r.menu_item_id = mi.id
      WHERE r.inventory_item_id = ${item.id}
      LIMIT 1
    `;

    if (!recipe) {
      console.error("❌ No recipe found for this ingredient.");
      return;
    }

    console.log(`🍴 Found Menu Item: ${recipe.menu_item_name} (Uses ${recipe.quantity_required} per serving)`);

    // 5. Create a Customer Order
    console.log("🧾 Creating Customer Order...");
    const [customerOrder] = await sql`
      INSERT INTO public.orders (user_id, status, subtotal, total)
      VALUES (${user.id}, 'pending', 1000, 1000)
      RETURNING id
    `;

    await sql`
      INSERT INTO public.order_items (order_id, menu_item_id, item_name, quantity, price, unit_price, total_price)
      VALUES (${customerOrder.id}, ${recipe.menu_item_id}, ${recipe.menu_item_name}, 2, 500, 500, 1000)
    `;

    // 6. Trace Order through Lifecycle with Staff Assignments
    // Workflow: pending -> confirmed (accountant) -> cooking (chef) -> ready -> delivered (rider)
    console.log("🔥 Tracing Order Lifecycle with Staff Assignments...");

    const flow = [
      { status: 'pending', label: 'ORDER PLACED' },
      { status: 'approved', label: 'ACCOUNTANT APPROVED', field: 'assigned_accountant_id', timestamp: 'accountant_approved_at' },
      { status: 'cooking', label: 'CHEF START COOKING', field: 'assigned_chef_id', timestamp: 'cooking_started_at' },
      { status: 'ready', label: 'READY FOR PICKUP', timestamp: 'cooking_completed_at' },
      { status: 'out_for_delivery', label: 'OUT FOR DELIVERY', field: 'assigned_rider_id', timestamp: 'delivery_started_at' },
      { status: 'delivered', label: 'DELIVERED', field: 'assigned_rider_id', timestamp: 'rider_delivered_at' }
    ];

    for (const step of flow) {
      console.log(`   ➡️ Action: ${step.label}`);
      
      const updates = { 
        status: step.status,
        updated_at: new Date().toISOString()
      };
      
      if (step.field) updates[step.field] = user.id;
      if (step.timestamp) updates[step.timestamp] = new Date().toISOString();

      await sql`
        UPDATE public.orders 
        SET ${sql(updates)}
        WHERE id = ${customerOrder.id}
      `;
      
      // Log history
      await sql`
        INSERT INTO public.order_status_history (order_id, status, notes, changed_by)
        VALUES (${customerOrder.id}, ${step.status}, ${`Order moved to ${step.status} by verification script`}, ${user.id})
      `;
    }

    console.log("✅ Order reached terminal state: DELIVERED");

    const [afterSale] = await sql`
      SELECT current_stock FROM public.inventory_items WHERE id = ${item.id}
    `;
    const expectedDeduction = recipe.quantity_required * 2;
    console.log(`✅ Stock after sale: ${afterSale.current_stock} ${item.unit}`);
    console.log(`📉 Total Deduction: ${Number(afterPurchase.current_stock) - Number(afterSale.current_stock)} (Expected: ${expectedDeduction})`);

    // 7. Check Transactions
    const transactions = await sql`
      SELECT type, quantity, notes 
      FROM public.inventory_transactions 
      WHERE inventory_item_id = ${item.id}
      ORDER BY created_at DESC
      LIMIT 2
    `;
    console.log("📜 Recent Transactions:");
    transactions.forEach(t => console.log(`   - ${t.type}: ${t.quantity} (${t.notes})`));

  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    await sql.end();
  }
}

verifyWorkflow();
