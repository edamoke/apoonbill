/**
 * PRINT SERVICE UTILITY
 * Handles formatting of receipts and routing to printers.
 */

export type PrintJob = {
    printerId: string
    content: string
    type: 'receipt' | 'ticket'
}

export function formatReceipt(order: any, settings: any = {}) {
    const businessName = "STARS & GARTERS"
    const businessAddress = "Nairobi, Kenya"
    const businessPhone = "+254 700 000000"
    
    let receipt = ""
    receipt += centerAlign(businessName) + "\n"
    receipt += centerAlign(businessAddress) + "\n"
    receipt += centerAlign(businessPhone) + "\n"
    receipt += "--------------------------------\n"
    receipt += `Order: ${order.id.slice(0, 8).toUpperCase()}\n`
    receipt += `Date: ${new Date(order.created_at).toLocaleString()}\n`
    receipt += `Staff: ${order.staff_name || 'POS User'}\n`
    if (order.table_number) receipt += `Table: ${order.table_number}\n`
    receipt += "--------------------------------\n"
    receipt += "QTY  ITEM                PRICE\n"
    receipt += "--------------------------------\n"

    order.order_items.forEach((item: any) => {
        const name = item.item_name.substring(0, 18).padEnd(19)
        const qty = item.quantity.toString().padEnd(4)
        const price = (item.price * item.quantity).toFixed(0).padStart(7)
        receipt += `${qty} ${name} ${price}\n`
        if (item.modifiers && item.modifiers.length > 0) {
            item.modifiers.forEach((m: any) => {
                receipt += `  + ${m.name}\n`
            })
        }
    })

    receipt += "--------------------------------\n"
    receipt += `SUBTOTAL: ${Number(order.subtotal).toFixed(2).padStart(20)}\n`
    if (order.discount_percent) {
        receipt += `DISCOUNT (${order.discount_percent}%): ${((order.subtotal * order.discount_percent)/100).toFixed(2).padStart(15)}\n`
    }
    receipt += `TAX (16%): ${Number(order.total - order.subtotal).toFixed(2).padStart(20)}\n`
    receipt += "================================\n"
    receipt += `TOTAL: KES ${Number(order.total).toFixed(2).padStart(19)}\n`
    receipt += "================================\n\n"
    
    if (order.etims_invoice_no) {
        receipt += centerAlign("KRA eTIMS INFO") + "\n"
        receipt += `CU INV: ${order.etims_invoice_no}\n`
        receipt += "--------------------------------\n"
    }

    receipt += centerAlign("THANK YOU FOR YOUR VISIT") + "\n\n\n\n"
    
    return receipt
}

export function formatKitchenTicket(order: any, categoryId?: string) {
    let ticket = ""
    ticket += "******** KITCHEN TICKET ********\n"
    ticket += `ORDER: ${order.id.slice(0, 8).toUpperCase()}\n`
    ticket += `TIME: ${new Date().toLocaleTimeString()}\n`
    if (order.table_number) ticket += `TABLE: ${order.table_number}\n`
    ticket += "--------------------------------\n"
    
    const items = categoryId 
        ? order.order_items.filter((i: any) => i.category_id === categoryId)
        : order.order_items

    if (items.length === 0) return null

    items.forEach((item: any) => {
        ticket += `${item.quantity} x ${item.item_name.toUpperCase()}\n`
        if (item.modifiers && item.modifiers.length > 0) {
            item.modifiers.forEach((m: any) => {
                ticket += `   -> ${m.name.toUpperCase()}\n`
            })
        }
        if (item.notes) ticket += `   NOTES: ${item.notes}\n`
        ticket += "\n"
    })

    ticket += "********************************\n\n\n\n"
    return ticket
}

function centerAlign(text: string, width: number = 32) {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2))
    return " ".repeat(spaces) + text
}

export async function sendToPrinter(printer: any, content: string) {
    console.log(`[PRINTER] Sending to ${printer.name} (${printer.interface_address}):`)
    console.log(content)
    
    // In a real browser environment, we'd use a local proxy or a print server
    // For this simulation, we'll return success
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
}
