import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function seedInventoryAndRecipes() {
  try {
    console.log("🚀 Seeding mock suppliers, inventory items, and recipes...")

    // 1. Create Mock Suppliers
    const suppliers = [
      { name: "Farmer's Fresh Produce", contact_person: "John Doe", category: "Vegetables" },
      { name: "Quality Meat Supplies", contact_person: "Jane Smith", category: "Meat" },
      { name: "Beverage World", contact_person: "Bob Wilson", category: "Beverages" },
      { name: "Global Dry Goods", contact_person: "Alice Brown", category: "Dry Goods" }
    ]

    for (const s of suppliers) {
      await sql`
        INSERT INTO public.suppliers (name, contact_person, category)
        VALUES (${s.name}, ${s.contact_person}, ${s.category})
        ON CONFLICT DO NOTHING
      `
    }
    console.log("✅ Suppliers created.")

    // 2. Create Base Inventory Items
    const inventoryItems = [
      { name: "Rice", unit: "kg", unit_cost: 150, current_stock: 100, category: "Dry Goods", sku: "DG-RICE-01" },
      { name: "Beef", unit: "kg", unit_cost: 600, current_stock: 50, category: "Meat", sku: "MT-BEEF-01" },
      { name: "Chicken", unit: "kg", unit_cost: 500, current_stock: 40, category: "Meat", sku: "MT-CHICKEN-01" },
      { name: "Potatoes", unit: "kg", unit_cost: 80, current_stock: 200, category: "Vegetables", sku: "VG-POT-01" },
      { name: "Cooking Oil", unit: "l", unit_cost: 250, current_stock: 30, category: "Dry Goods", sku: "DG-OIL-01" },
      { name: "Milk", unit: "l", unit_cost: 60, current_stock: 50, category: "Dairy", sku: "DR-MILK-01" },
      { name: "Tea Leaves", unit: "kg", unit_cost: 400, current_stock: 10, category: "Dry Goods", sku: "DG-TEA-01" },
      { name: "Coffee Beans", unit: "kg", unit_cost: 1200, current_stock: 5, category: "Dry Goods", sku: "DG-COF-01" },
      { name: "Sukuma Wiki", unit: "kg", unit_cost: 50, current_stock: 20, category: "Vegetables", sku: "VG-SUK-01" }
    ]

    for (const item of inventoryItems) {
      await sql`
        INSERT INTO public.inventory_items (name, unit, unit_cost, current_stock, category, sku)
        VALUES (${item.name}, ${item.unit}, ${item.unit_cost}, ${item.current_stock}, ${item.category}, ${item.sku})
        ON CONFLICT (sku) DO UPDATE 
        SET current_stock = EXCLUDED.current_stock, unit_cost = EXCLUDED.unit_cost
      `
    }
    console.log("✅ Inventory items created/updated.")

    // 3. Sync products to menu_items if missing
    console.log("Syncing products to menu_items...")
    const products = await sql`SELECT * FROM public.products`
    const menuCategories = await sql`SELECT id, name FROM public.menu_categories`
    
    for (const prod of products) {
      const categoryId = menuCategories[0]?.id || null // Fallback to first category or null
      
      await sql`
        INSERT INTO public.menu_items (id, name, description, price, image_url, category_id)
        VALUES (
          ${prod.id}, 
          ${prod.name}, 
          ${prod.description || ''}, 
          ${prod.price}, 
          ${prod.image_url || null}, 
          ${categoryId}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          image_url = EXCLUDED.image_url,
          category_id = EXCLUDED.category_id
      `
    }

    // 4. Link Menu Items to Recipes
    const menuItems = await sql`SELECT id, name FROM public.menu_items`
    const invItems = await sql`SELECT id, name FROM public.inventory_items`

    const findInvId = (name: string) => invItems.find(i => i.name === name)?.id

    console.log(`Linking ${menuItems.length} menu items to recipes...`)

    for (const item of menuItems) {
      const name = item.name.toLowerCase()
      let ingredients: { name: string, qty: number }[] = []

      if (name.includes("rice") || name.includes("pilau")) {
        ingredients.push({ name: "Rice", qty: 0.25 })
        ingredients.push({ name: "Cooking Oil", qty: 0.02 })
      }
      if (name.includes("beef")) {
        ingredients.push({ name: "Beef", qty: 0.25 })
      }
      if (name.includes("chicken")) {
        ingredients.push({ name: "Chicken", qty: 0.25 })
      }
      if (name.includes("chips") || name.includes("patatine") || name.includes("potatoes")) {
        ingredients.push({ name: "Potatoes", qty: 0.3 })
        ingredients.push({ name: "Cooking Oil", qty: 0.05 })
      }
      if (name.includes("tea") || name.includes("chai")) {
        ingredients.push({ name: "Milk", qty: 0.2 })
        ingredients.push({ name: "Tea Leaves", qty: 0.005 })
      }
      if (name.includes("coffee") || name.includes("latte")) {
        ingredients.push({ name: "Milk", qty: 0.2 })
        ingredients.push({ name: "Coffee Beans", qty: 0.015 })
      }
      if (name.includes("sukuma")) {
        ingredients.push({ name: "Sukuma Wiki", qty: 0.2 })
        ingredients.push({ name: "Cooking Oil", qty: 0.01 })
      }

      // Default for others to ensure the chain works
      if (ingredients.length === 0) {
        ingredients.push({ name: "Cooking Oil", qty: 0.01 }) // Minimal fallback
      }

      for (const ing of ingredients) {
        const invId = findInvId(ing.name)
        if (invId) {
          await sql`
            INSERT INTO public.recipes (menu_item_id, inventory_item_id, quantity_required)
            VALUES (${item.id}, ${invId}, ${ing.qty})
            ON CONFLICT (menu_item_id, inventory_item_id) DO UPDATE
            SET quantity_required = EXCLUDED.quantity_required
          `
        }
      }
    }

    console.log("✅ Recipes linked to menu items.")
    console.log("✅ Pipeline set up perfectly.")

  } catch (error) {
    console.error("❌ Seeding failed:", error)
  } finally {
    await sql.end()
  }
}

seedInventoryAndRecipes()
