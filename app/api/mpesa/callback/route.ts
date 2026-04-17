import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with service role for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] M-Pesa callback received:", JSON.stringify(body, null, 2))

    const { Body } = body

    if (!Body?.stkCallback) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid callback data" })
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback

    // Find order by checkout request ID
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("mpesa_checkout_request_id", CheckoutRequestID)
      .single()

    if (!order) {
      console.error("[v0] Order not found for CheckoutRequestID:", CheckoutRequestID)
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Order not found" })
    }

    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = ""
      let transactionDate = ""
      let phoneNumber = ""
      let amount = 0

      if (CallbackMetadata?.Item) {
        CallbackMetadata.Item.forEach((item: any) => {
          if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value
          if (item.Name === "TransactionDate") transactionDate = item.Value
          if (item.Name === "PhoneNumber") phoneNumber = item.Value
          if (item.Name === "Amount") amount = item.Value
        })
      }

      // Update order as paid
      await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          status: "confirmed",
          mpesa_receipt_number: mpesaReceiptNumber,
          mpesa_transaction_date: transactionDate,
          mpesa_phone_number: phoneNumber,
        })
        .eq("id", order.id)

      console.log("[v0] Payment successful for order:", order.id)
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          mpesa_error_message: ResultDesc,
        })
        .eq("id", order.id)

      console.log("[v0] Payment failed for order:", order.id, ResultDesc)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" })
  } catch (error: any) {
    console.error("[v0] M-Pesa callback error:", error)
    return NextResponse.json({ ResultCode: 1, ResultDesc: error.message })
  }
}
