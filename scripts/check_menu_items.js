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

async function checkMenuItems() {
  try {
    const { data: menuItems, error: mError } = await supabase.from('menu_items').select('id, name');
    if (mError) throw mError;
    console.log(`Total menu_items: ${menuItems.length}`);
    if (menuItems.length > 0) {
      console.log('Sample menu_items:', menuItems.slice(0, 5));
    }

    const { data: products, error: pError } = await supabase.from('products').select('id, name');
    if (pError) throw pError;
    console.log(`Total products: ${products.length}`);
    if (products.length > 0) {
        console.log('Sample products:', products.slice(0, 5));
    }

    // Check if any product ID exists in menu_items
    const menuItemIds = new Set(menuItems.map(m => m.id));
    const matchingProducts = products.filter(p => menuItemIds.has(p.id));
    console.log(`Products matching menu_item IDs: ${matchingProducts.length}`);

  } catch (err) {
    console.error('Error checking items:', err);
  }
}

checkMenuItems();
