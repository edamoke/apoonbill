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

async function fixRecipes() {
  try {
    // 1. Get all inventory items
    const { data: inventoryItems } = await supabase.from('inventory_items').select('*');
    console.log(`Found ${inventoryItems.length} inventory items.`);

    const getInvId = (name) => inventoryItems.find(i => i.name.toLowerCase() === name.toLowerCase())?.id;

    // Existing items in DB (based on inspect_inventory.js)
    // - Minced Beef
    // - Potatoes
    
    // Let's also ensure other common items exist if they don't
    const meatSup = (await supabase.from('suppliers').select('id').eq('category', 'Meat').limit(1).single()).data?.id;
    const vegSup = (await supabase.from('suppliers').select('id').eq('category', 'Vegetables').limit(1).single()).data?.id;

    const itemsToEnsure = [
        { name: 'Minced Beef', category: 'Meat', unit: 'kg', current_stock: 100, reorder_level: 20, supplier_id: meatSup },
        { name: 'Potatoes', category: 'Vegetables', unit: 'kg', current_stock: 200, reorder_level: 50, supplier_id: vegSup },
        { name: 'Chicken Breast', category: 'Meat', unit: 'kg', current_stock: 50, reorder_level: 10, supplier_id: meatSup },
        { name: 'Cooking Oil', category: 'Pantry', unit: 'litres', current_stock: 50, reorder_level: 10 },
        { name: 'Sugar Cane', category: 'Vegetables', unit: 'kg', current_stock: 100, reorder_level: 20 },
        { name: 'Cream Cheese', category: 'Pantry', unit: 'kg', current_stock: 10, reorder_level: 2 },
        { name: 'Choma Sausage', category: 'Meat', unit: 'kg', current_stock: 20, reorder_level: 5, supplier_id: meatSup },
        { name: 'Black Bean', category: 'Vegetables', unit: 'kg', current_stock: 15, reorder_level: 3 },
        { name: 'Passion Fruit', category: 'Vegetables', unit: 'kg', current_stock: 20, reorder_level: 5 },
        { name: 'Beetroot', category: 'Vegetables', unit: 'kg', current_stock: 10, reorder_level: 2 },
        { name: 'Onions', category: 'Vegetables', unit: 'kg', current_stock: 50, reorder_level: 10, supplier_id: vegSup },
        { name: 'Avocado', category: 'Vegetables', unit: 'kg', current_stock: 20, reorder_level: 5, supplier_id: vegSup },
        { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', current_stock: 30, reorder_level: 10, supplier_id: vegSup },
        { name: 'Cheddar Cheese', category: 'Pantry', unit: 'kg', current_stock: 15, reorder_level: 5 }
    ];

    for (const item of itemsToEnsure) {
        if (!getInvId(item.name)) {
            console.log(`Creating missing inventory item: ${item.name}`);
            await supabase.from('inventory_items').insert(item);
        }
    }

    // Refresh inventory items
    const { data: updatedInventory } = await supabase.from('inventory_items').select('*');
    const findId = (name) => updatedInventory.find(i => i.name.toLowerCase() === name.toLowerCase())?.id;

    const beefId = findId('Minced Beef');
    const potatoId = findId('Potatoes');
    const chickenId = findId('Chicken Breast');
    const oilId = findId('Cooking Oil');
    const sugarId = findId('Sugar Cane');
    const creamCheeseId = findId('Cream Cheese');
    const sausageId = findId('Choma Sausage');
    const beanId = findId('Black Bean');
    const passionId = findId('Passion Fruit');
    const beetrootId = findId('Beetroot');
    const onionId = findId('Onions');
    const avocadoId = findId('Avocado');
    const tomatoId = findId('Tomatoes');
    const cheeseId = findId('Cheddar Cheese');

    // 2. Get all menu items
    const { data: menuItems } = await supabase.from('menu_items').select('id, name');
    console.log(`Analyzing ${menuItems.length} menu items...`);

    // 3. Clear existing recipes to start fresh and avoid duplicates
    console.log('Clearing existing recipes...');
    await supabase.from('recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const recipesMap = new Map();

    const addRecipe = (menuId, invId, qty) => {
        if (!menuId || !invId) return;
        const key = `${menuId}_${invId}`;
        recipesMap.set(key, { menu_item_id: menuId, inventory_item_id: invId, quantity_required: qty });
    };

    for (const item of menuItems) {
        const name = item.name.toLowerCase();
        // Use regex for more reliable choma matching
        const isChoma = /choma|sausage/.test(name);
        console.log(`Checking item: ${name}, isChoma: ${isChoma}`);

        // Fries mapping
        if (name.includes('fries') || name.includes('chips')) {
            if (potatoId) addRecipe(item.id, potatoId, 0.3);
            if (oilId) addRecipe(item.id, oilId, 0.05);
        }

        // Beef mapping
        if (name.includes('beef')) {
            if (beefId) addRecipe(item.id, beefId, 0.15);
        }

        // Chicken mapping
        if (name.includes('chicken') || name.includes('piecer')) {
            if (chickenId) addRecipe(item.id, chickenId, 0.2);
            if (oilId) addRecipe(item.id, oilId, 0.02);
        }

        // Juice mapping
        if (name.includes('sugarcane') || name.includes('sugar cane')) {
            if (sugarId) addRecipe(item.id, sugarId, 0.5);
        }

        // Cream Cheese mapping
        if (name.includes('cream cheese')) {
            if (creamCheeseId) addRecipe(item.id, creamCheeseId, 0.05);
        }

        // Sausage mapping
        if (isChoma || name.includes('choma')) {
            console.log(`Matched sausage for: ${name}`);
            if (sausageId) addRecipe(item.id, sausageId, 0.1);
        }

        // Specific mappings for known missing items
        if (name.includes('coleslaw') || name.includes('fried onions') || name.includes('veggies')) {
            if (onionId) addRecipe(item.id, onionId, 0.02);
        }

        if (name.includes('avocado') || name.includes('guacamole')) {
            if (avocadoId) addRecipe(item.id, avocadoId, 0.1);
        }

        if (name.includes('vegan') || name.includes('vegetarian')) {
             if (beanId) addRecipe(item.id, beanId, 0.1);
        }

        // Veggie mappings
        if (name.includes('bean')) {
            if (beanId) addRecipe(item.id, beanId, 0.1);
        }
        if (name.includes('passion')) {
            if (passionId) addRecipe(item.id, passionId, 0.2);
        }
        if (name.includes('beetroot')) {
            if (beetrootId) addRecipe(item.id, beetrootId, 0.2);
        }

        // Generic cheese for burgers
        if (name.includes('cheese') && name.includes('burger')) {
             if (cheeseId) addRecipe(item.id, cheeseId, 0.02);
             if (beefId && !name.includes('chicken')) addRecipe(item.id, beefId, 0.15);
        }

        // Avocado mapping
        if (name.includes('avocado') || name.includes('guacamole')) {
            if (avocadoId) addRecipe(item.id, avocadoId, 0.1);
        }

        // Onion mapping
        if (name.includes('onion')) {
            if (onionId) addRecipe(item.id, onionId, 0.02);
        }

        // Tomato mapping
        if (name.includes('tomato') || (name.includes('burger') && !name.includes('fries'))) {
            // Burgers usually have tomato unless specified
            if (tomatoId) addRecipe(item.id, tomatoId, 0.03);
        }

        // Coleslaw implies onions/cabbage (let's use onions for now as proxy if cabbage missing)
        if (name.includes('coleslaw')) {
            if (onionId) addRecipe(item.id, onionId, 0.02);
        }
    }

    const recipesToInsert = Array.from(recipesMap.values());
    console.log(`Inserting ${recipesToInsert.length} unique recipe links...`);
    
    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < recipesToInsert.length; i += batchSize) {
        const batch = recipesToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('recipes').insert(batch);
        if (error) {
            console.error('Error inserting batch:', error.message);
            // If batch fails, try individual items to find the culprit
            for (const r of batch) {
                const { error: e } = await supabase.from('recipes').insert(r);
                if (e) console.error(`Failed individual insert for ${item.name}:`, e.message);
            }
        }
    }

    console.log('Recipe fix completed successfully.');

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

fixRecipes();
