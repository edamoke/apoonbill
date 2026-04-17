import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function seedData() {
  try {
    console.log("🚀 Starting comprehensive system data seeding...")

    // 1. Ensure Categories exist
    console.log("Seeding categories...")
    const categories = [
      { name: "Main Dishes", slug: "main-dishes" },
      { name: "Drinks", slug: "drinks" },
      { name: "Desserts", slug: "desserts" },
      { name: "Appetizers", slug: "appetizers" },
    ]

    for (const cat of categories) {
      const existing = await sql`SELECT id FROM public.categories WHERE slug = ${cat.slug}`
      if (existing.length === 0) {
        await sql`
          INSERT INTO public.categories (name, slug)
          VALUES (${cat.name}, ${cat.slug})
        `
      }
    }

    const dbCategories = await sql`SELECT id, name FROM public.categories`
    const mainDishesId = dbCategories.find(c => c.name === "Main Dishes")?.id
    const drinksId = dbCategories.find(c => c.name === "Drinks")?.id

    // 2. Ensure Products exist
    console.log("Seeding products...")
    const products = [
      { name: "Grilled Steak", slug: "grilled-steak", price: 1500, category_id: mainDishesId },
      { name: "Chicken Curry", slug: "chicken-curry", price: 1200, category_id: mainDishesId },
      { name: "Fresh Passion Juice", slug: "fresh-passion-juice", price: 350, category_id: drinksId },
      { name: "Local Beer", slug: "local-beer", price: 450, category_id: drinksId },
    ]

    for (const prod of products) {
      if (!prod.category_id) continue
      const existing = await sql`SELECT id FROM public.products WHERE name = ${prod.name}`
      if (existing.length === 0) {
        await sql`
          INSERT INTO public.products (name, slug, price, category_id)
          VALUES (${prod.name}, ${prod.slug}, ${prod.price}, ${prod.category_id})
        `
      }
    }

    const dbProducts = await sql`SELECT id, name, price FROM public.products`

    // 3. Ensure Inventory Items exist (if table exists)
    const tableCheck = await sql`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory_items')`
    if (tableCheck[0].exists) {
      console.log("Seeding inventory items...")
      const inventoryItems = [
        { name: "Beef Fillet", unit: "kg", current_stock: 50, min_stock: 10 },
        { name: "Chicken Breast", unit: "kg", current_stock: 30, min_stock: 5 },
        { name: "Cooking Oil", unit: "liters", current_stock: 20, min_stock: 5 },
      ]

      for (const item of inventoryItems) {
        const existing = await sql`SELECT id FROM public.inventory_items WHERE name = ${item.name}`
        if (existing.length === 0) {
          await sql`
            INSERT INTO public.inventory_items (name, unit, current_stock)
            VALUES (${item.name}, ${item.unit}, ${item.current_stock})
          `
        }
      }
    }

    // 4. Create some test orders if we have a user
    const userCheck = await sql`SELECT id FROM public.profiles LIMIT 1`
    if (userCheck.length > 0) {
      console.log("Seeding test orders...")
      const userId = userCheck[0].id
      
      const testOrder = {
        user_id: userId,
        customer_name: "Test Seeding Customer",
        customer_email: "test@example.com",
        customer_phone: "0712345678",
        total: 2500,
        subtotal: 2400,
        delivery_fee: 100,
        status: "pending",
        order_type: "delivery",
        payment_method: "cash",
        payment_status: "pending"
      }

      const [order] = await sql`
        INSERT INTO public.orders (
          user_id, customer_name, customer_email, customer_phone, 
          total, subtotal, delivery_fee, status, order_type, 
          payment_method, payment_status
        ) VALUES (
          ${testOrder.user_id}, ${testOrder.customer_name}, ${testOrder.customer_email}, 
          ${testOrder.customer_phone}, ${testOrder.total}, ${testOrder.subtotal}, 
          ${testOrder.delivery_fee}, ${testOrder.status}, ${testOrder.order_type}, 
          ${testOrder.payment_method}, ${testOrder.payment_status}
        ) RETURNING id
      `

      if (order && dbProducts.length > 0) {
        console.log("Seeding order items...")
        await sql`
          INSERT INTO public.order_items (order_id, product_id, item_name, quantity, unit_price, total_price, price)
          VALUES (
            ${order.id}, ${dbProducts[0].id}, ${dbProducts[0].name}, 1, ${dbProducts[0].price}, ${dbProducts[0].price}, ${dbProducts[0].price}
          )
        `
      }
    }

    console.log("✅ System data seeding completed successfully!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
  } finally {
    await sql.end()
  }
}

seedData()
