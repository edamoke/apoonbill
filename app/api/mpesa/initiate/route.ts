import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// M-Pesa API configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379"
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || ""
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || ""
const MPESA_API_URL = process.env.MPESA_API_URL || "https://sandbox.safaricom.co.ke"

// Generate timestamp in format: YYYYMMDDHHmmss
function getTimestamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// Generate password: Base64(Shortcode + Passkey + Timestamp)
function getPassword(timestamp: string) {
  const password = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
  return Buffer.from(password).toString("base64")
}

// Get M-Pesa access token
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")

  const response = await fetch(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber, amount, orderId, accountReference } = body

    // Validate required fields
    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // --- SECURITY HARDENING: Verify Amount against Order in DB ---
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("total")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Allow for small rounding differences but basically enforce DB amount
    if (Math.abs(order.total - amount) > 0.01) {
       console.warn(`[M-Pesa Security] Amount mismatch for order ${orderId}. Client: ${amount}, DB: ${order.total}`)
    }
    
    const finalAmount = order.total

    // Format phone number (remove leading 0, add 254)
    const formattedPhone = phoneNumber.startsWith("254")
      ? phoneNumber
      : phoneNumber.startsWith("0")
        ? `254${phoneNumber.slice(1)}`
        : `254${phoneNumber}`

    // Get access token
    const accessToken = await getAccessToken()
    const timestamp = getTimestamp()
    const password = getPassword(timestamp)

    // Initiate STK Push
    const stkPushResponse = await fetch(`${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(finalAmount),
        PartyA: formattedPhone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: `${MPESA_CALLBACK_URL}/api/mpesa/callback`,
        AccountReference: accountReference || `ORDER-${orderId}`,
        TransactionDesc: `Payment for order ${orderId}`,
      }),
    })

    const stkData = await stkPushResponse.json()

    if (stkData.ResponseCode === "0") {
      // Update order with M-Pesa checkout request ID
      await supabase
        .from("orders")
        .update({
          mpesa_checkout_request_id: stkData.CheckoutRequestID,
          payment_status: "processing",
        })
        .eq("id", orderId)

      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: stkData.errorMessage || "Failed to initiate payment",
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    console.error("[v0] M-Pesa initiate error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
