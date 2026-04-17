import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function setupTestScenario() {
  try {
    console.log("🚀 Setting up Test Scenario: Chicken Alfredo Pasta...")

    // 1. Get or Create Category
    const [category] = await sql`
      INSERT INTO public.menu_categories (name, slug)
      VALUES ('Pasta', 'pasta')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `

    // 2. Create Inventory Items
    const ingredients = [
      { name: 'Fettuccine Pasta', sku: 'INV-PASTA-001', unit: 'kg', unit_cost: 300, current_stock: 10 },
      { name: 'Chicken Breast', sku: 'INV-CHICKEN-001', unit: 'kg', unit_cost: 600, current_stock: 20 },
      { name: 'Heavy Cream', sku: 'INV-CREAM-001', unit: 'l', unit_cost: 450, current_stock: 15 },
      { name: 'Parmesan Cheese', sku: 'INV-PARM-001', unit: 'kg', unit_cost: 1200, current_stock: 5 },
      { name: 'Unsalted Butter', sku: 'INV-BUTTER-001', unit: 'kg', unit_cost: 800, current_stock: 8 },
      { name: 'Fresh Garlic', sku: 'INV-GARLIC-001', unit: 'kg', unit_cost: 400, current_stock: 2 },
      { name: 'Coke 300ml', sku: 'INV-COKE-001', unit: 'pcs', unit_cost: 50, current_stock: 100 }
    ]

    const invItems = []
    for (const item of ingredients) {
      const [res] = await sql`
        INSERT INTO public.inventory_items (name, sku, unit, unit_cost, current_stock)
        VALUES (${item.name}, ${item.sku}, ${item.unit}, ${item.unit_cost}, ${item.current_stock})
        ON CONFLICT (sku) DO UPDATE SET 
          unit_cost = EXCLUDED.unit_cost,
          current_stock = EXCLUDED.current_stock
        RETURNING id, name, current_stock;
      `
      invItems.push(res)
    }
    console.log("✅ Inventory Items Ready")

    // 3. Create Menu Items
    let pastaMenu;
    try {
        [pastaMenu] = await sql`
            INSERT INTO public.menu_items (name, description, price, category_id, is_available)
            VALUES ('Chicken Alfredo Pasta', 'Creamy fettuccine with grilled chicken and parmesan', 1200, ${category.id}, true)
            RETURNING id;
        `
    } catch (e) {
        [pastaMenu] = await sql`SELECT id FROM public.menu_items WHERE name = 'Chicken Alfredo Pasta'`;
    }

    let drinkMenu;
    try {
        [drinkMenu] = await sql`
            INSERT INTO public.menu_items (name, description, price, category_id, is_available)
            VALUES ('Coke 300ml', 'Chilled Coca Cola bottle', 150, ${category.id}, true)
            RETURNING id;
        `
    } catch (e) {
        [drinkMenu] = await sql`SELECT id FROM public.menu_items WHERE name = 'Coke 300ml'`;
    }
    
    console.log("✅ Menu Items Ready:", { pastaMenuId: pastaMenu.id, drinkMenuId: drinkMenu.id })

    // 4. Define Recipes
    const pastaRecipe = [
      { name: 'Fettuccine Pasta', qty: 0.200 },
      { name: 'Chicken Breast', qty: 0.150 },
      { name: 'Heavy Cream', qty: 0.100 },
      { name: 'Parmesan Cheese', qty: 0.050 },
      { name: 'Unsalted Butter', qty: 0.030 },
      { name: 'Fresh Garlic', qty: 0.010 }
    ]

    for (const r of pastaRecipe) {
      const inv = invItems.find(i => i.name === r.name)
      if (inv) {
        await sql`
            INSERT INTO public.recipes (menu_item_id, inventory_item_id, quantity_required)
            VALUES (${pastaMenu.id}, ${inv.id}, ${r.qty})
            ON CONFLICT (menu_item_id, inventory_item_id) DO UPDATE SET quantity_required = EXCLUDED.quantity_required;
        `
      }
    }

    // Drink recipe (1 to 1)
    const cokeInv = invItems.find(i => i.name === 'Coke 300ml')
    if (cokeInv) {
        await sql`
            INSERT INTO public.recipes (menu_item_id, inventory_item_id, quantity_required)
            VALUES (${drinkMenu.id}, ${cokeInv.id}, 1)
            ON CONFLICT (menu_item_id, inventory_item_id) DO UPDATE SET quantity_required = EXCLUDED.quantity_required;
        `
    }
    console.log("✅ Recipes Defined")

    // 5. Ensure Chart of Accounts exists for Trigger
    await sql`
      INSERT INTO public.chart_of_accounts (code, name, type)
      VALUES ('1000', 'Cash at Hand', 'asset'), ('4000', 'Food Sales', 'revenue')
      ON CONFLICT (code) DO NOTHING;
    `

    console.log("\nSummary of Setup:")
    console.log("- Category: Pasta")
    console.log("- Meal: Chicken Alfredo Pasta (Price: 1200, Ingredients: 6)")
    console.log("- Drink: Coke 300ml (Price: 150, Ingredients: 1)")

  } catch (err) {
    console.error("❌ Setup failed:", err)
  } finally {
    await sql.end()
  }
}

setupTestScenario()
