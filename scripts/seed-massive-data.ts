import postgres from "postgres"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env" })

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING!, {
  ssl: "require",
})

async function seedMassiveData() {
  try {
    console.log("🚀 Seeding massive data for real dashboard metrics...")
    
    const users = await sql`SELECT id FROM public.profiles LIMIT 5`
    const products = await sql`SELECT id, price, name FROM public.products LIMIT 20`
    
    if (!users.length || !products.length) return

    // 1. Create many orders for the last 30 days
    console.log("Generating 150+ orders...")
    for (let i = 0; i < 150; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      
      const userId = users[Math.floor(Math.random() * users.length)].id
      const orderType = Math.random() > 0.4 ? 'pickup' : 'delivery'
      const address = orderType === 'pickup' ? `Table ${Math.floor(Math.random() * 10) + 1}` : 'Home Address'
      const status = 'complete'
      const paymentStatus = 'completed'
      const paymentMethod = ['cash', 'mpesa', 'card'][Math.floor(Math.random() * 3)]
      
      const [order] = await sql`
        INSERT INTO public.orders (
          user_id, customer_name, customer_phone, customer_email, delivery_address, 
          order_type, total, status, payment_method, payment_status, created_at
        ) VALUES (
          ${userId}, 'Test Customer', '0700000000', 'test@example.com', ${address},
          ${orderType}, 0, ${status}, ${paymentMethod}, ${paymentStatus}, ${date}
        ) RETURNING id
      `
      
      // Add 1-5 items per order
      let orderTotal = 0
      const itemsCount = Math.floor(Math.random() * 5) + 1
      for (let j = 0; j < itemsCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const qty = Math.floor(Math.random() * 3) + 1
        orderTotal += Number(product.price) * qty
        
        await sql`
          INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, item_name, price)
          VALUES (${order.id}, ${product.id}, ${qty}, ${product.price}, ${product.name}, ${product.price})
        `
      }
      
      await sql`UPDATE public.orders SET total = ${orderTotal} WHERE id = ${order.id}`
    }

    // 2. Set some stock levels to critical
    console.log("Setting some stock to critical...")
    await sql`
      UPDATE public.inventory_items 
      SET current_stock = reorder_level - 2
      WHERE id IN (SELECT id FROM public.inventory_items LIMIT 3)
    `

    console.log("✅ Massive data seed complete!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
  } finally {
    await sql.end()
  }
}

seedMassiveData()
