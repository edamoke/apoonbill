"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail, sendWelcomeGuestEmail } from "@/lib/email"
import { awardPointsForPurchase } from "./loyalty-actions"

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

    // 1. Determine target user ID or handle guest
    let targetUserId = data.user_id
    let isGuest = false

    let temporaryPassword = ""
    if (!targetUserId) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        targetUserId = authUser.id
      } else {
        // Handle guest checkout: Check if profile exists by email
        const email = data.formData.customerEmail.toLowerCase().trim()
        
        // 1a. Check if Auth user exists
        const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers()
        const existingAuthUser = users?.find(u => u.email === email)

        if (existingAuthUser) {
          targetUserId = existingAuthUser.id
        } else {
          // 1b. Create a new Auth account for the guest
          temporaryPassword = Math.random().toString(36).slice(-8) + "!" // Simple random password
          const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: {
              full_name: data.formData.customerName,
              phone: data.formData.customerPhone,
            }
          })

          if (authError) {
            console.error("[Order Action] Auth account creation error:", authError)
            // Fallback to checking profile if auth fails (e.g. user exists but list failed)
            const { data: existingProfile } = await adminSupabase
              .from("profiles")
              .select("id")
              .eq("email", email)
              .single()
            
            if (existingProfile) {
              targetUserId = existingProfile.id
            } else {
              return { success: false, error: "Failed to create guest account: " + authError.message }
            }
          } else {
            targetUserId = newAuthUser.user.id
            isGuest = true
            
            // Send welcome email with temporary password
            await sendWelcomeGuestEmail(data.formData.customerName, email, temporaryPassword)
          }
        }
      }
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

    // Apply 10% Online Order Discount
    const discountPercent = 10
    const discountAmount = calculatedSubtotal * (discountPercent / 100)
    const discountedSubtotal = calculatedSubtotal - discountAmount

    // Fixed delivery fee logic
    const expectedDeliveryFee = data.formData.orderType === 'delivery' ? 100 : 0 
    const calculatedTotal = discountedSubtotal + expectedDeliveryFee

    const finalSubtotal = discountedSubtotal
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
        discount_percent: discountPercent,
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

    // 4. Award Loyalty Points
    if (targetUserId) {
      try {
        await awardPointsForPurchase(targetUserId, finalTotal, order.id)
      } catch (loyaltyErr) {
        console.error("[Order Action] Failed to award loyalty points:", loyaltyErr)
      }
    }

    // 5. Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail(order, data.formData.customerEmail)
    } catch (emailErr) {
      console.error("[Order Action] Failed to send confirmation email:", emailErr)
      // Don't fail the order just because of email
    }

    // If it was a guest checkout and no address provided, notify about rewards (handled by frontend via isGuest flag)
    return { 
      success: true, 
      orderId: order.id, 
      isGuest,
      needsAddressReminder: isGuest && !data.formData.deliveryAddress 
    }

  } catch (error: any) {
    console.error("[Order Action] Unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
