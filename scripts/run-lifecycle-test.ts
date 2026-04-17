import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function executeTestOrder() {
  try {
    console.log("🚀 Executing Full Lifecycle Test Order...")

    // 1. Get IDs
    const [pasta] = await sql`SELECT id, name, price FROM public.menu_items WHERE name = 'Chicken Alfredo Pasta' LIMIT 1;`
    const [drink] = await sql`SELECT id, name, price FROM public.menu_items WHERE name = 'Coke 300ml' LIMIT 1;`
    
    // Get a test user (admin)
    const [user] = await sql`SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1;`

    if (!pasta || !drink || !user) {
        throw new Error("Required data missing. Run setup-test-scenario.ts first.")
    }

    // 2. Snapshot Initial Inventory
    console.log("\n--- BASELINE SNAPSHOT ---")
    const initialInv = await sql`
      SELECT name, current_stock, unit_cost 
      FROM public.inventory_items 
      WHERE sku IN ('INV-PASTA-001', 'INV-CHICKEN-001', 'INV-CREAM-001', 'INV-PARM-001', 'INV-BUTTER-001', 'INV-GARLIC-001', 'INV-COKE-001');
    `
    console.table(initialInv)

    // 3. Create Order
    console.log("\nCreating Order...")
    const subtotal = Number(pasta.price) + Number(drink.price)
    const total = subtotal // ignoring tax for simplicity in this script verification
    
    const [order] = await sql`
      INSERT INTO public.orders (
        user_id, customer_name, order_type, table_number, 
        subtotal, total, status, source, payment_method, payment_status
      ) VALUES (
        ${user.id}, 'Analysis Test Guest', 'pickup', 'Table 5',
        ${subtotal}, ${total}, 'pending', 'pos', 'cash', 'pending'
      ) RETURNING id;
    `

    // Insert items
    await sql`
      INSERT INTO public.order_items (order_id, menu_item_id, item_name, quantity, price)
      VALUES 
        (${order.id}, ${pasta.id}, ${pasta.name}, 1, ${pasta.price}),
        (${order.id}, ${drink.id}, ${drink.name}, 1, ${drink.price});
    `
    console.log(`✅ Order Created: ${order.id}`)

    // 4. Move to Delivered/Completed (Fire Triggers)
    console.log("\nFinalizing Order (Firing Triggers)...")
    await sql`UPDATE public.orders SET status = 'delivered', payment_status = 'completed' WHERE id = ${order.id};`
    console.log("✅ Order Completed.")

    // 5. Audit Results
    console.log("\n--- POST-ORDER AUDIT ---")
    
    console.log("\n1. Inventory Deduction Check:")
    const postInv = await sql`
      SELECT name, current_stock 
      FROM public.inventory_items 
      WHERE sku IN ('INV-PASTA-001', 'INV-CHICKEN-001', 'INV-CREAM-001', 'INV-PARM-001', 'INV-BUTTER-001', 'INV-GARLIC-001', 'INV-COKE-001');
    `
    console.table(postInv)

    console.log("\n2. Accounting Entry Check:")
    const legacyLedger = await sql`
      SELECT id, transaction_date, description, amount 
      FROM public.accounting_ledger 
      WHERE reference_id = ${order.id};
    `
    if (legacyLedger.length > 0) {
        console.log("✅ Legacy Accounting Ledger Found")
        console.table(legacyLedger)
    } else {
        console.log("❌ NO LEGACY LEDGER ENTRIES CREATED")
    }

    const modernLedger = await sql`
      SELECT id, transaction_date, description 
      FROM public.general_ledger 
      WHERE reference_id = ${order.id};
    `
    if (modernLedger.length > 0) {
        console.log("✅ Modern General Ledger Found")
        const ledgerId = modernLedger[0].id;
        const entries = await sql`
          SELECT a.name as account, e.debit, e.credit 
          FROM public.ledger_entries e
          JOIN public.chart_of_accounts a ON e.account_id = a.id
          WHERE e.ledger_id = ${ledgerId};
        `
        console.table(entries)
    } else {
        console.log("❌ NO MODERN LEDGER ENTRIES CREATED")
    }

    // 6. Cost Analysis
    const recipeCosts = await sql`
      SELECT r.quantity_required, i.unit_cost, i.name
      FROM public.recipes r
      JOIN public.inventory_items i ON r.inventory_item_id = i.id
      WHERE r.menu_item_id IN (${pasta.id}, ${drink.id});
    `
    const totalCost = recipeCosts.reduce((acc, r) => acc + (Number(r.quantity_required) * Number(r.unit_cost)), 0)
    
    console.log("\n--- PROFIT ANALYSIS ---")
    console.log(`Sale Price:     Ksh ${total}`)
    console.log(`Creation Cost:  Ksh ${totalCost.toFixed(2)}`)
    console.log(`Gross Profit:   Ksh ${(total - totalCost).toFixed(2)}`)
    console.log(`Margin:         ${(((total - totalCost) / total) * 100).toFixed(1)}%`)

  } catch (err) {
    console.error("❌ Test failed:", err)
  } finally {
    await sql.end()
  }
}

executeTestOrder()
