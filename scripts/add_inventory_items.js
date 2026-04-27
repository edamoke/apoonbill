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

const newItems = [
  { name: 'Ginger', unit: 'kg', category: 'Vegetables', current_stock: 0, reorder_level: 2 },
  { name: 'Lime', unit: 'pcs', category: 'Vegetables', current_stock: 0, reorder_level: 50 },
  { name: 'Pineapple', unit: 'pcs', category: 'Vegetables', current_stock: 0, reorder_level: 10 },
  { name: 'Tamarind', unit: 'kg', category: 'Vegetables', current_stock: 0, reorder_level: 2 },
  { name: 'Ketchup', unit: 'liters', category: 'Pantry', current_stock: 0, reorder_level: 5 },
  { name: 'Tomatoes', unit: 'kg', category: 'Vegetables', current_stock: 0, reorder_level: 10 },
  { name: 'Onions', unit: 'kg', category: 'Vegetables', current_stock: 0, reorder_level: 10 },
  { name: 'Viennas', unit: 'pack', category: 'Meat', current_stock: 0, reorder_level: 5 },
  { name: 'Eggs', unit: 'tray', category: 'Pantry', current_stock: 0, reorder_level: 2 },
  { name: 'Breadcrumbs', unit: 'kg', category: 'Pantry', current_stock: 0, reorder_level: 2 },
  { name: 'Garlic Powder', unit: 'kg', category: 'Pantry', current_stock: 0, reorder_level: 1 },
  { name: 'Chilli Powder', unit: 'kg', category: 'Pantry', current_stock: 0, reorder_level: 1 },
  { name: 'Cayenne Powder', unit: 'kg', category: 'Pantry', current_stock: 0, reorder_level: 1 },
  { name: 'Onion Powder', unit: 'kg', category: 'Pantry', current_stock: 0, reorder_level: 1 },
  { name: 'Lettuce', unit: 'head', category: 'Vegetables', current_stock: 0, reorder_level: 10 },
  { name: 'Choma Sausages', unit: 'pack', category: 'Meat', current_stock: 0, reorder_level: 5 },
  { name: 'Sausages', unit: 'pack', category: 'Meat', current_stock: 0, reorder_level: 5 },
  { name: 'Chicken', unit: 'kg', category: 'Meat', current_stock: 0, reorder_level: 20 },
];

async function addItems() {
  console.log('Fetching existing items...');
  const { data: existingItems, error: fetchError } = await supabase
    .from('inventory_items')
    .select('name');

  if (fetchError) {
    console.error('Error fetching existing items:', fetchError);
    return;
  }

  const existingNames = new Set(existingItems.map(item => item.name.toLowerCase()));
  const itemsToAdd = newItems.filter(item => !existingNames.has(item.name.toLowerCase()));

  if (itemsToAdd.length === 0) {
    console.log('All items already exist in inventory.');
    return;
  }

  console.log(`Adding ${itemsToAdd.length} new items...`);
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(itemsToAdd)
    .select();

  if (error) {
    console.error('Error inserting items:', error);
  } else {
    console.log('Successfully added items:');
    data.forEach(item => console.log(`- ${item.name}`));
  }
}

addItems();
