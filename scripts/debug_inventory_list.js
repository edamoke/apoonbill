import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInventory() {
  try {
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) throw error;

    console.log('--- ALL INVENTORY ITEMS ---');
    inventoryItems.forEach(item => {
      console.log(`- "${item.name}" (ID: ${item.id})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugInventory();
