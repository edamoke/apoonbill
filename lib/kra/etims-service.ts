import { createClient } from "@/lib/supabase/server"

/**
 * KRA eTIMS INTEGRATION SKELETON
 * 
 * This service handles the mapping and transmission of invoices to the KRA eTIMS system.
 * It is designed to work with either a hardware VSCU or software API.
 */

export type EtimsInvoicePayload = {
  invoiceNo: string
  customerPin?: string
  customerName?: string
  totalAmount: number
  taxAmount: number
  items: {
    name: string
    quantity: number
    unitPrice: number
    taxCategory: string // A, B, C, D
    kraItemCode?: string
  }[]
}

export async function transmitToEtims(orderId: string) {
  const supabase = await createClient()

  try {
    // 1. Fetch detailed order info
    const { data: order, error: oError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          menu_items (
            name,
            products (
              kra_product_code,
              hs_code,
              vat_category
            )
          )
        )
      `)
      .eq("id", orderId)
      .single()

    if (oError || !order) throw new Error("Order not found")

    // 2. Map to eTIMS Format
    const payload: EtimsInvoicePayload = {
      invoiceNo: order.id.slice(0, 8).toUpperCase(),
      totalAmount: Number(order.total || order.total_price),
      taxAmount: Number(order.tax_amount || 0),
      items: (order as any).order_items.map((item: any) => ({
        name: item.menu_items?.name || "Item",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        taxCategory: item.menu_items?.products?.vat_category || "A",
        kraItemCode: item.menu_items?.products?.kra_product_code
      }))
    }

    // 3. Log the attempt
    const { data: logEntry } = await supabase
      .from("kra_etims_logs")
      .insert({
        order_id: orderId,
        payload,
        status: 'sending'
      })
      .select()
      .single()

    // 4. API Transmission (Simulated Skeleton)
    // In production, this would call the KRA VSCU or Online API
    const response = await simulateEtimsApiCall(payload)

    // 5. Update Order and Logs
    if (response.success) {
      await supabase
        .from("orders")
        .update({
          etims_invoice_no: response.cuInvoiceNo,
          etims_qr_code: response.qrData,
          etims_status: 'synced',
          etims_sync_at: new Date().toISOString()
        })
        .eq("id", orderId)

      await supabase
        .from("kra_etims_logs")
        .update({
          response,
          status: 'success'
        })
        .eq("id", logEntry.id)
    } else {
        throw new Error(response.message)
    }

    return { success: true, data: response }

  } catch (error: any) {
    console.error("eTIMS Sync Failed:", error.message)
    
    await supabase
      .from("orders")
      .update({
        etims_status: 'failed',
        etims_error_message: error.message
      })
      .eq("id", orderId)

    return { success: false, error: error.message }
  }
}

/**
 * MOCK API CALL
 * Replace this with actual fetch() to KRA endpoint
 */
async function simulateEtimsApiCall(payload: EtimsInvoicePayload) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // In a real scenario, this returns the Control Unit (CU) details
  return {
    success: true,
    cuInvoiceNo: `KRA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    qrData: `https://itax.kra.go.ke/KRA-Portal/verification.htm?id=${payload.invoiceNo}`,
    message: "Invoice validated by eTIMS"
  }
}
