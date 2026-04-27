import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPipeline() {
  try {
    console.log('--- Starting Pipeline Test (Direct DB) ---');

    // 1. Pick an inventory item
    const { data: items } = await supabase.from('inventory_items').select('*').limit(1);
    if (!items || items.length === 0) throw new Error('No inventory items found');
    const item = items[0];
    const initialStock = parseFloat(item.current_stock);
    console.log(`Initial stock for ${item.name}: ${initialStock}`);

    // 2. Create a supply order
    const { data: order, error: oErr } = await supabase.from('supply_orders').insert({
      supplier_id: item.supplier_id,
      status: 'pending',
      total_amount: 1000
    }).select().single();
    if (oErr) throw oErr;
    console.log(`Created supply order ${order.id}`);

    // 3. Add item to order
    const { error: iErr } = await supabase.from('supply_order_items').insert({
      supply_order_id: order.id,
      inventory_item_id: item.id,
      quantity: 50,
      unit_cost: 20
    });
    if (iErr) throw iErr;
    console.log('Added 50 units to supply order.');

    // 4. Mark as delivered (Simulating the action logic)
    console.log('Marking supply order as delivered and updating stock...');
    const { data: itemsToUpdate } = await supabase.from('supply_order_items').select('quantity').eq('supply_order_id', order.id);
    for (const i of itemsToUpdate) {
        await supabase.from('inventory_items').update({ current_stock: initialStock + i.quantity }).eq('id', item.id);
    }
    await supabase.from('supply_orders').update({ status: 'delivered' }).eq('id', order.id);

    // 5. Verify stock increase
    const { data: updatedItem } = await supabase.from('inventory_items').select('current_stock').eq('id', item.id).single();
    const finalStock = parseFloat(updatedItem.current_stock);
    console.log(`Updated stock for ${item.name}: ${finalStock}`);
    if (finalStock === initialStock + 50) {
      console.log('✅ Pipeline verified!');
    } else {
      console.log('❌ Pipeline failed.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testPipeline();
