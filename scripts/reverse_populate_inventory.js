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
    // Fetch existing suppliers to avoid duplicates if unique constraint is missing
    const { data: existingSuppliers } = await supabase.from('suppliers').select('*');
    
    for (const s of suppliers) {
      const exists = existingSuppliers?.find(ex => ex.name === s.name);
      if (!exists) {
        await supabase.from('suppliers').insert(s);
      }
    }

    const { data: insertedSuppliers, error: sError } = await supabase
      .from('suppliers')
      .select();

    if (sError) throw sError;
    console.log(`Inserted ${insertedSuppliers.length} suppliers.`);

    const meatSup = insertedSuppliers.find(s => s.name === 'Meat Supplier').id;
    const vegSup = insertedSuppliers.find(s => s.name === 'Veg Supplier').id;
    const pantrySup = insertedSuppliers.find(s => s.name === 'Pantry Supplier').id;
    const bevSup = insertedSuppliers.find(s => s.name === 'Beverage Supplier').id;

    // 2. Define Inventory Items
    const inventoryItems = [
      // Meat
      { name: 'Beef', category: 'Meat', unit: 'kg', current_stock: 100, min_stock_level: 20, supplier_id: meatSup },
      { name: 'Goat Meat', category: 'Meat', unit: 'kg', current_stock: 50, min_stock_level: 10, supplier_id: meatSup },
      { name: 'Chicken (Kienyeji)', category: 'Meat', unit: 'pcs', current_stock: 30, min_stock_level: 5, supplier_id: meatSup },
      { name: 'Tilapia', category: 'Meat', unit: 'pcs', current_stock: 40, min_stock_level: 10, supplier_id: meatSup },
      { name: 'King Fish', category: 'Meat', unit: 'kg', current_stock: 20, min_stock_level: 5, supplier_id: meatSup },
      // Veg
      { name: 'Potatoes', category: 'Vegetables', unit: 'kg', current_stock: 200, min_stock_level: 50, supplier_id: vegSup },
      { name: 'Traditional Vegetables', category: 'Vegetables', unit: 'kg', current_stock: 50, min_stock_level: 10, supplier_id: vegSup },
      { name: 'Onions', category: 'Vegetables', unit: 'kg', current_stock: 50, min_stock_level: 10, supplier_id: vegSup },
      { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', current_stock: 50, min_stock_level: 10, supplier_id: vegSup },
      // Pantry
      { name: 'Maize Flour', category: 'Pantry', unit: 'kg', current_stock: 100, min_stock_level: 20, supplier_id: pantrySup },
      { name: 'Wheat Flour', category: 'Pantry', unit: 'kg', current_stock: 100, min_stock_level: 20, supplier_id: pantrySup },
      { name: 'Rice', category: 'Pantry', unit: 'kg', current_stock: 100, min_stock_level: 20, supplier_id: pantrySup },
      { name: 'Cooking Oil', category: 'Pantry', unit: 'litres', current_stock: 50, min_stock_level: 10, supplier_id: pantrySup },
      { name: 'Sugar', category: 'Pantry', unit: 'kg', current_stock: 20, min_stock_level: 5, supplier_id: pantrySup },
      { name: 'Salt', category: 'Pantry', unit: 'kg', current_stock: 10, min_stock_level: 2, supplier_id: pantrySup },
      // Beverage
      { name: 'Milk', category: 'Beverages', unit: 'litres', current_stock: 50, min_stock_level: 10, supplier_id: bevSup },
      { name: 'Tea Leaves', category: 'Beverages', unit: 'kg', current_stock: 5, min_stock_level: 1, supplier_id: bevSup },
      { name: 'Coffee Beans', category: 'Beverages', unit: 'kg', current_stock: 5, min_stock_level: 1, supplier_id: bevSup },
      { name: 'Soda 300ml', category: 'Beverages', unit: 'pcs', current_stock: 100, min_stock_level: 24, supplier_id: bevSup },
      { name: 'Mineral Water 500ml', category: 'Beverages', unit: 'pcs', current_stock: 100, min_stock_level: 24, supplier_id: bevSup }
    ];

    console.log('Inserting inventory items...');
    const { data: existingInv } = await supabase.from('inventory_items').select('*');
    for (const item of inventoryItems) {
      const exists = existingInv?.find(ex => ex.name === item.name);
      if (!exists) {
        await supabase.from('inventory_items').insert(item);
      }
    }

    const { data: insertedInventory, error: iError } = await supabase
      .from('inventory_items')
      .select();

    if (iError) throw iError;
    console.log(`Inserted ${insertedInventory.length} inventory items.`);

    // 3. Link Products to Inventory via Recipes
    // We need to fetch products first
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, name');

    if (pError) throw pError;
    console.log(`Found ${products.length} products.`);

    const recipes = [];
    
    // Mapping helper
    const getInvId = (name) => insertedInventory.find(i => i.name === name)?.id;

    for (const product of products) {
      const pName = product.name.toLowerCase();
      
      // Basic Chips
      if (pName.includes('chips')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Potatoes'), quantity: 0.3 }); // 300g
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Cooking Oil'), quantity: 0.05 });
      }
      
      // Beef items
      if (pName.includes('beef')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Beef'), quantity: 0.25 }); // 250g
      }

      // Mbuzi items
      if (pName.includes('mbuzi')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Goat Meat'), quantity: 0.25 });
      }

      // Chicken items
      if (pName.includes('kuku') || pName.includes('chicken')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Chicken (Kienyeji)'), quantity: 0.25 });
      }

      // Fish items
      if (pName.includes('tilapia')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Tilapia'), quantity: 1 });
      }

      // Chapati
      if (pName.includes('chapati')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Wheat Flour'), quantity: 0.1 });
      }

      // Sima / Ugali
      if (pName.includes('sima')) {
        recipes.push({ product_id: product.id, inventory_item_id: getInvId('Maize Flour'), quantity: 0.2 });
      }

      // Beverages with Milk
      if (pName.includes('tea') || pName.includes('coffee') || pName.includes('chocolate')) {
        if (!pName.includes('black') && !pName.includes('mineral')) {
          recipes.push({ product_id: product.id, inventory_item_id: getInvId('Milk'), quantity: 0.15 });
        }
      }
    }

    if (recipes.length > 0) {
      console.log(`Inserting ${recipes.length} recipe links...`);
      const { data: existingRecipes } = await supabase.from('recipes').select('*');
      for (const r of recipes) {
        const exists = existingRecipes?.find(ex => ex.product_id === r.product_id && ex.inventory_item_id === r.inventory_item_id);
        if (!exists) {
          await supabase.from('recipes').insert(r);
        }
      }
      console.log('Recipes linked successfully.');
    }

  } catch (error) {
    console.error('Error in population script:', error);
  }
}

populate();
