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

async function inspectInventory() {
  try {
    const { data: inventoryItems, error: iError } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (iError) throw iError;

    console.log('--- INVENTORY ITEMS ---');
    inventoryItems.forEach(item => {
      console.log(`- ${item.name} (ID: ${item.id}, Category: ${item.category}, Stock: ${item.current_stock})`);
    });

    // Manual join to avoid relationship errors
    const { data: recipes, error: rError } = await supabase.from('recipes').select('*');
    if (rError) throw rError;

    const { data: products, error: pError } = await supabase.from('products').select('id, name');
    if (pError) throw pError;

    const { data: menuItems, error: mError } = await supabase.from('menu_items').select('id, name');
    if (mError) throw mError;

    const productsMap = new Map(products.map(p => [p.id, p.name]));
    const menuItemsMap = new Map(menuItems.map(m => [m.id, m.name]));
    const inventoryMap = new Map(inventoryItems.map(i => [i.id, i.name]));

    console.log('\n--- RECIPE LINKS ---');
    recipes.forEach(r => {
      const productName = productsMap.get(r.product_id) || menuItemsMap.get(r.menu_item_id) || 'Unknown Product';
      const itemName = inventoryMap.get(r.inventory_item_id) || 'Unknown Item';
      const qty = r.quantity || r.quantity_required || 0;
      console.log(`- Product: "${productName}" (PID: ${r.product_id || r.menu_item_id}) links to Inventory: "${itemName}" (IID: ${r.inventory_item_id}, Qty: ${qty})`);
    });

    const productIdsWithRecipes = new Set(recipes.map(r => r.product_id || r.menu_item_id));
    const productsMissingRecipes = products.filter(p => !productIdsWithRecipes.has(p.id));

    console.log('\n--- PRODUCTS MISSING RECIPES ---');
    productsMissingRecipes.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id})`);
    });

  } catch (err) {
    console.error('Error inspecting inventory:', err);
  }
}

inspectInventory();
