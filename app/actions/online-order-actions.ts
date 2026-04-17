"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"

interface OrderItem {
  productId: string
  quantity: number
  name: string
  price: number
}

interface OrderData {
  items: OrderItem[]
  formData: {
    customerName: string
    customerEmail: string
    customerPhone: string
    deliveryAddress: string
    orderType: string
    specialInstructions: string
    paymentMethod: string
  }
  subtotal: number
  deliveryFee: number
  total: number
  source?: string
}

export async function createOnlineOrder(data: OrderData & { user_id?: string }) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // 1. Determine target user ID
    let targetUserId = data.user_id

    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: "Authentication required" }
      }
      targetUserId = user.id
    }

    // --- SECURITY HARDENING: Server-side Price & Total Validation ---
    // Fetch actual products from DB to verify prices
    const productIds = data.items.map(item => item.productId)
    const { data: products, error: productsError } = await adminSupabase
      .from("products")
      .select("id, price")
      .in("id", productIds)

    if (productsError || !products) {
      return { success: false, error: "Failed to verify product prices" }
    }

    const productMap = new Map(products.map(p => [p.id, p.price]))
    
    let calculatedSubtotal = 0
    const validatedItems = data.items.map(item => {
      const dbPrice = productMap.get(item.productId)
      if (dbPrice === undefined) {
        throw new Error(`Product ${item.productId} not found`)
      }
      calculatedSubtotal += dbPrice * item.quantity
      return {
        ...item,
        price: dbPrice // Use DB price, ignore client-provided price
      }
    })

    // Fixed delivery fee logic (should ideally be from DB settings)
    const expectedDeliveryFee = data.formData.orderType === 'delivery' ? 150 : 0 
    const calculatedTotal = calculatedSubtotal + expectedDeliveryFee

    // Tolerance check for floating point if needed, but here we enforce server calculation
    // We override client provided totals with server calculated ones
    const finalSubtotal = calculatedSubtotal
    const finalDeliveryFee = expectedDeliveryFee
    const finalTotal = calculatedTotal

    console.log("[Order Action] Creating order for user:", targetUserId)

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: targetUserId,
        customer_name: data.formData.customerName,
        customer_email: data.formData.customerEmail.toLowerCase().trim(),
        customer_phone: data.formData.customerPhone,
        delivery_address: data.formData.deliveryAddress,
        order_type: data.formData.orderType,
        delivery_type: data.formData.orderType === 'delivery' ? 'delivery' : 'takeaway',
        special_instructions: data.formData.specialInstructions,
        subtotal: finalSubtotal,
        delivery_fee: finalDeliveryFee,
        total: finalTotal,
        status: "pending",
        payment_method: data.formData.paymentMethod,
        payment_status: data.formData.paymentMethod === "cash" ? "pending" : "processing",
        discount_percent: (data as any).discount_percent || 0,
        source: data.source || 'web',
      })
      .select()
      .single()

    if (orderError) {
      console.error("[Order Action] Order creation error:", JSON.stringify(orderError, null, 2))
      return { success: false, error: orderError.message }
    }

    // 3. Create order items with validated prices
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsError } = await adminSupabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[Order Action] Order items creation error:", JSON.stringify(itemsError, null, 2))
      return { success: false, error: itemsError.message, orderId: order.id }
    }

    return { success: true, orderId: order.id }

  } catch (error: any) {
    console.error("[Order Action] Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
