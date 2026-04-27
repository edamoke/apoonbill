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

async function syncProductsToMenuItems() {
  try {
    const { data: products, error: pError } = await supabase.from('products').select('*');
    if (pError) throw pError;
    console.log(`Found ${products.length} products.`);

    const { data: menuItems, error: mError } = await supabase.from('menu_items').select('id');
    if (mError) throw mError;
    const menuItemIds = new Set(menuItems.map(m => m.id));

    // Also get all categories to make sure we don't violate foreign key constraints
    const { data: menuCategories, error: mcError } = await supabase.from('menu_categories').select('id');
    if (mcError) throw mcError;
    const menuCategoryIds = new Set(menuCategories.map(c => c.id));

    const toInsert = products.filter(p => !menuItemIds.has(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price || 0,
      category_id: menuCategoryIds.has(p.category_id) ? p.category_id : null,
      image_url: p.image_url,
      is_available: true
    }));

    if (toInsert.length > 0) {
      console.log(`Inserting ${toInsert.length} products into menu_items...`);
      const { error: insError } = await supabase.from('menu_items').insert(toInsert);
      if (insError) throw insError;
      console.log('Sync complete.');
    } else {
      console.log('No products to sync.');
    }
  } catch (err) {
    console.error('Error syncing:', err.message);
  }
}

syncProductsToMenuItems();
