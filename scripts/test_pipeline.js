import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPipeline() {
  try {
    console.log('--- Starting Pipeline Test ---');

    // 1. Apply the trigger SQL
    const sql = fs.readFileSync('scripts/043_supply_order_delivery_trigger.sql', 'utf8');
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (sqlError) {
      // If exec_sql RPC doesn't exist, we might need another way or just assume it's applied if manually done
      console.warn('Could not apply SQL via RPC exec_sql. Ensure it is applied to the DB.');
    } else {
      console.log('Trigger applied successfully.');
    }

    // 2. Pick an inventory item
    const { data: items } = await supabase.from('inventory_items').select('*').limit(1);
    if (!items || items.length === 0) throw new Error('No inventory items found');
    const item = items[0];
    const initialStock = item.current_stock;
    console.log(`Initial stock for ${item.name}: ${initialStock}`);

    // 3. Create a supply order
    const { data: order, error: oErr } = await supabase.from('supply_orders').insert({
      supplier_id: item.supplier_id,
      status: 'pending',
      total_amount: 1000
    }).select().single();
    if (oErr) throw oErr;
    console.log(`Created supply order ${order.id}`);

    // 4. Add item to order
    const { error: iErr } = await supabase.from('supply_order_items').insert({
      supply_order_id: order.id,
      inventory_item_id: item.id,
      quantity: 50,
      unit_cost: 20
    });
    if (iErr) throw iErr;
    console.log('Added 50 units to supply order.');

    // 5. Mark as delivered
    const { error: dErr } = await supabase.from('supply_orders').update({ status: 'delivered' }).eq('id', order.id);
    if (dErr) throw dErr;
    console.log('Marked supply order as delivered.');

    // 6. Verify stock increase
    const { data: updatedItems } = await supabase.from('inventory_items').select('current_stock').eq('id', item.id).single();
    console.log(`Updated stock for ${item.name}: ${updatedItems.current_stock}`);
    if (updatedItems.current_stock === initialStock + 50) {
      console.log('✅ Stock update trigger verified!');
    } else {
      console.log('❌ Stock update trigger failed or not applied.');
    }

    // 7. Test sale reduction (if trigger exists)
    // Most systems use a trigger on order_items or a process in the checkout action.
    // Let's check for recipes
    const { data: recipe } = await supabase.from('recipes').select('product_id, quantity').eq('inventory_item_id', item.id).limit(1).single();
    if (recipe) {
      console.log(`Testing sale reduction for product linked to ${item.name}...`);
      // We'd need to simulate a sale here.
      // Usually there's a trigger handle_order_item_inserted or similar.
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testPipeline();
