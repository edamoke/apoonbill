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

async function populate() {
  try {
    // 1. Create Generic Suppliers
    const suppliers = [
      { name: 'Meat Supplier', email: 'meat@example.com', category: 'Meat' },
      { name: 'Veg Supplier', email: 'veg@example.com', category: 'Vegetables' },
      { name: 'Pantry Supplier', email: 'pantry@example.com', category: 'Pantry' },
      { name: 'Beverage Supplier', email: 'bev@example.com', category: 'Beverages' }
    ];

    console.log('Inserting suppliers...');
    const { data: existingSuppliers } = await supabase.from('suppliers').select('*');
    for (const s of suppliers) {
      const exists = existingSuppliers?.find(ex => ex.name === s.name);
      if (!exists) await supabase.from('suppliers').insert(s);
    }
    const { data: insertedSuppliers } = await supabase.from('suppliers').select();
    const meatSup = insertedSuppliers.find(s => s.name === 'Meat Supplier').id;
    const vegSup = insertedSuppliers.find(s => s.name === 'Veg Supplier').id;
    const pantrySup = insertedSuppliers.find(s => s.name === 'Pantry Supplier').id;
    const bevSup = insertedSuppliers.find(s => s.name === 'Beverage Supplier').id;

    // 2. Define Inventory Items (Comprehensive list based on feedback)
    const inventoryItems = [
      // Meats
      { name: 'Beef Mince', category: 'Meat', unit: 'kg', current_stock: 100, reorder_level: 20, supplier_id: meatSup },
      { name: 'Chicken Mince', category: 'Meat', unit: 'kg', current_stock: 50, reorder_level: 10, supplier_id: meatSup },
      { name: 'Chicken Wings', category: 'Meat', unit: 'kg', current_stock: 30, reorder_level: 5, supplier_id: meatSup },
      { name: 'Chicken Breast', category: 'Meat', unit: 'kg', current_stock: 30, reorder_level: 5, supplier_id: meatSup },
      { name: 'Chicken Thigh', category: 'Meat', unit: 'kg', current_stock: 30, reorder_level: 5, supplier_id: meatSup },
      { name: 'Chicken Drumstick', category: 'Meat', unit: 'kg', current_stock: 30, reorder_level: 5, supplier_id: meatSup },
      { name: 'Fish Fillet', category: 'Meat', unit: 'kg', current_stock: 40, reorder_level: 10, supplier_id: meatSup },
      // Vegetables
      { name: 'Potatoes', category: 'Vegetables', unit: 'kg', current_stock: 200, reorder_level: 50, supplier_id: vegSup },
      { name: 'Lettuce', category: 'Vegetables', unit: 'kg', current_stock: 20, reorder_level: 5, supplier_id: vegSup },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', current_stock: 30, reorder_level: 5, supplier_id: vegSup },
      // Pantry / Spices / Condiments
      { name: 'Wheat Flour', category: 'Pantry', unit: 'kg', current_stock: 100, reorder_level: 20, supplier_id: pantrySup },
      { name: 'Cooking Oil', category: 'Pantry', unit: 'litres', current_stock: 50, reorder_level: 10, supplier_id: pantrySup },
      { name: 'Mayonnaise', category: 'Pantry', unit: 'kg', current_stock: 10, reorder_level: 2, supplier_id: pantrySup },
      { name: 'Garlic Powder', category: 'Pantry', unit: 'kg', current_stock: 5, reorder_level: 1, supplier_id: pantrySup },
      { name: 'Onion Powder', category: 'Pantry', unit: 'kg', current_stock: 5, reorder_level: 1, supplier_id: pantrySup },
      { name: 'Black Pepper', category: 'Pantry', unit: 'kg', current_stock: 5, reorder_level: 1, supplier_id: pantrySup },
      { name: 'Cayenne Pepper', category: 'Pantry', unit: 'kg', current_stock: 5, reorder_level: 1, supplier_id: pantrySup },
      // Beverage
      { name: 'Milk', category: 'Beverages', unit: 'litres', current_stock: 50, reorder_level: 10, supplier_id: bevSup }
    ];

    console.log('Inserting inventory items...');
    for (const item of inventoryItems) {
      const { data: existing } = await supabase.from('inventory_items').select('id').eq('name', item.name).single();
      if (!existing) {
        const { error } = await supabase.from('inventory_items').insert(item);
        if (error) console.error(`Error inserting ${item.name}:`, error.message);
      } else {
        await supabase.from('inventory_items').update({ supplier_id: item.supplier_id }).eq('id', existing.id);
      }
    }
    const { data: insertedInventory } = await supabase.from('inventory_items').select();

    // 3. Link Products to Inventory via Recipes
    const { data: products } = await supabase.from('products').select('id, name');
    
    console.log('Clearing old recipes...');
    await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const getInvId = (name) => insertedInventory.find(i => i.name.toLowerCase() === name.toLowerCase())?.id;

    const potId = getInvId('Potatoes');
    const oilId = getInvId('Cooking Oil');
    const beefMinceId = getInvId('Beef Mince');
    const chickenMinceId = getInvId('Chicken Mince');
    const chickenWingsId = getInvId('Chicken Wings');
    const chickenBreastId = getInvId('Chicken Breast');
    const fishId = getInvId('Fish Fillet');
    const flourId = getInvId('Wheat Flour');
    const lettuceId = getInvId('Lettuce');
    const tomatoesId = getInvId('Tomatoes');
    const mayoId = getInvId('Mayonnaise');

    for (const product of products) {
      const pName = product.name.toLowerCase();
      const recipesToInsert = [];

      // Base items for almost all burgers/sandwiches
      if (pName.includes('burger')) {
          if (lettuceId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: lettuceId, quantity_required: 0.02 });
          if (tomatoesId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: tomatoesId, quantity_required: 0.03 });
          if (mayoId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: mayoId, quantity_required: 0.015 });
      }

      // French Fries / Chips
      if (pName.includes('chips') || pName.includes('fries')) {
        if (potId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: potId, quantity_required: 0.3 });
        if (oilId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: oilId, quantity_required: 0.05 });
      }
      
      // Beef Burgers
      if (pName.includes('beef') && pName.includes('burger')) {
        if (beefMinceId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: beefMinceId, quantity_required: 0.15 });
      }

      // Chicken Burgers / Parts
      if (pName.includes('chicken') || pName.includes('piecer') || pName.includes('wings')) {
        if (pName.includes('burger')) {
            if (chickenMinceId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: chickenMinceId, quantity_required: 0.15 });
        } else if (pName.includes('wings')) {
            if (chickenWingsId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: chickenWingsId, quantity_required: 0.25 });
        } else {
            // Default to breast/parts for other chicken items
            if (chickenBreastId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: chickenBreastId, quantity_required: 0.2 });
        }
        
        if (flourId && (pName.includes('breaded') || pName.includes('piecer') || pName.includes('wings'))) {
            recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: flourId, quantity_required: 0.05 });
        }
        if (oilId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: oilId, quantity_required: 0.02 });
      }

      // Fish Burger
      if (pName.includes('fish')) {
        if (fishId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: fishId, quantity_required: 0.15 });
        if (flourId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: flourId, quantity_required: 0.05 });
        if (oilId) recipesToInsert.push({ menu_item_id: product.id, inventory_item_id: oilId, quantity_required: 0.02 });
      }

      for (const r of recipesToInsert) {
          const { error } = await supabase.from('recipes').insert(r);
          if (error) console.error(`Failed to insert recipe for ${product.name}:`, error.message);
      }
    }
    console.log('Population finished.');
  } catch (error) {
    console.error('Error:', error);
  }
}

populate();
