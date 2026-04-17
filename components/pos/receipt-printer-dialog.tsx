"use client"

import { useState, useEffect } from "react"
import { Printer, CheckCircle2, Loader2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getPrinters } from "@/app/actions/pos-actions"
import { formatReceipt, formatKitchenTicket, sendToPrinter } from "@/lib/print-service"
import { transmitToEtimsAction } from "@/app/actions/etims-actions"

export function ReceiptPrinterDialog({ 
  isOpen, 
  onClose, 
  orderData 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  orderData: any 
}) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)
  const [printStep, setPrintStep] = useState<'options' | 'printing' | 'success' | 'error'>('options')
  const [printers, setPrinters] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadPrinters()
    }
  }, [isOpen])

  async function loadPrinters() {
    const res = await getPrinters()
    if (res.success) {
      setPrinters(res.printers || [])
    }
  }

  const handlePrint = async (targetType: 'receipt' | 'kitchen') => {
    setIsPrinting(true)
    setPrintStep('printing')
    
    try {
      // 1. Sync with eTIMS first if it's a customer receipt and not already synced
      if (targetType === 'receipt' && !orderData.etims_invoice_no) {
         await transmitToEtimsAction(orderData.id)
         // In a real app we might need to re-fetch orderData here to get the new eTIMS info
      }

      // 2. Find target printers
      const targetPrinters = printers.filter(p => p.type === targetType && p.is_active)
      
      if (targetPrinters.length === 0) {
        throw new Error(`No active ${targetType} printers found. Please check settings.`)
      }

      // 3. Format and send to each target printer
      for (const printer of targetPrinters) {
        let content = ""
        if (targetType === 'receipt') {
          content = formatReceipt(orderData)
        } else {
          // For kitchen, we might need to handle specific categories per printer
          // This is a simplified version sending all items
          content = formatKitchenTicket(orderData) || ""
        }

        if (content) {
          const result = await sendToPrinter(printer, content)
          if (!result.success) throw new Error(`Failed to print to ${printer.name}`)
        }
      }

      setPrintStep('success')
      
      // Auto close after success
      setTimeout(() => {
         onClose()
         setPrintStep('options')
      }, 2000)

    } catch (error: any) {
      setErrorMessage(error.message)
      setPrintStep('error')
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card text-foreground rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Order Completion and Printing</DialogTitle>
          <DialogDescription>Options for printing receipts and tickets</DialogDescription>
        </DialogHeader>
        <div className="p-8">
           {printStep === 'options' && (
              <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                 <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Printer className="h-10 w-10 text-primary" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Order Completed</h2>
                    <p className="text-muted-foreground font-medium">Payment received successfully. Ready to print?</p>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="h-14 rounded-2xl font-black text-lg gap-2" 
                      onClick={() => handlePrint('receipt')}
                      disabled={isPrinting}
                    >
                       <Printer className="h-5 w-5" /> PRINT CUSTOMER RECEIPT
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 rounded-2xl font-black text-lg gap-2" 
                      onClick={() => handlePrint('kitchen')}
                      disabled={isPrinting}
                    >
                       <Download className="h-5 w-5" /> KITCHEN TICKET
                    </Button>
                    <Button variant="ghost" className="rounded-xl font-bold text-muted-foreground/60" onClick={onClose}>
                       SKIP PRINTING
                    </Button>
                 </div>
              </div>
           )}

           {printStep === 'printing' && (
              <div className="py-12 text-center space-y-6 animate-in fade-in duration-300">
                 <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Sending to Printer</h2>
                    <p className="text-muted-foreground font-medium italic">Communicating with hardware...</p>
                 </div>
              </div>
           )}

           {printStep === 'success' && (
              <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
                 <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-emerald-500">Receipt Printed</h2>
                    <p className="text-muted-foreground font-medium">Transaction finished.</p>
                 </div>
              </div>
           )}

           {printStep === 'error' && (
              <div className="py-12 text-center space-y-6 animate-in shake duration-300">
                 <div className="h-20 w-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-12 w-12 text-rose-500" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-rose-500">Printing Failed</h2>
                    <p className="text-muted-foreground font-medium">{errorMessage}</p>
                 </div>
                 <Button variant="outline" onClick={() => setPrintStep('options')} className="rounded-xl font-bold">
                    TRY AGAIN
                 </Button>
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
