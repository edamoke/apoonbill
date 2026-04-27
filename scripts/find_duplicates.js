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

async function findDuplicates() {
  try {
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) throw error;

    const duplicates = [];
    const seen = new Map();

    inventoryItems.forEach(item => {
      const normalized = item.name.toLowerCase().trim();
      if (seen.has(normalized)) {
        duplicates.push({
          original: seen.get(normalized),
          duplicate: item
        });
      } else {
        seen.set(normalized, item);
      }
    });

    if (duplicates.length === 0) {
      console.log('No duplicate inventory items found.');
    } else {
      console.log('Duplicate Inventory Items Found:');
      duplicates.forEach(d => {
        console.log(`- "${d.original.name}" (ID: ${d.original.id}) AND "${d.duplicate.name}" (ID: ${d.duplicate.id})`);
      });
      
      console.log('\nAnalyzing Recipes for these duplicates...');
      for (const d of duplicates) {
        const { data: recipes, error: rError } = await supabase
          .from('recipes')
          .select('*, products(name)')
          .or(`inventory_item_id.eq.${d.original.id},inventory_item_id.eq.${d.duplicate.id}`);
        
        if (rError) throw rError;
        
        if (recipes.length > 0) {
          console.log(`Recipes linked to "${d.original.name}" or its duplicate:`);
          recipes.forEach(r => {
            console.log(`  - Product: ${r.products.name}, Inv Item ID: ${r.inventory_item_id}, Qty: ${r.quantity}`);
          });
        } else {
          console.log(`No recipes found for "${d.original.name}" or its duplicate.`);
        }
      }
    }
  } catch (err) {
    console.error('Error finding duplicates:', err);
  }
}

findDuplicates();
