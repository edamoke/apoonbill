"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { updateOrderStatus } from "@/app/actions/admin-order-actions"
import { useToast } from "@/hooks/use-toast"

interface AccountingOrderCardProps {
  order: any
}

export function AccountingOrderCard({ order }: AccountingOrderCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const approveOrder = async () => {
    setLoading(true)
    const result = await updateOrderStatus(order.id, "approved")
    
    if (result.success) {
      toast({ title: "Order Approved", description: "The order has been successfully approved." })
      router.refresh()
    } else {
      toast({ title: "Approval Failed", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  const rejectOrder = async () => {
    if (!confirm("Are you sure you want to reject this order?")) return
    setLoading(true)
    const result = await updateOrderStatus(order.id, "cancelled")
    
    if (result.success) {
      toast({ title: "Order Rejected", description: "The order has been cancelled." })
      router.refresh()
    } else {
      toast({ title: "Rejection Failed", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{order.profiles?.full_name || order.profiles?.email || "Guest"}</span>
          </div>
        </div>
        <Badge variant="secondary">{order.payment_method}</Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">Ksh {Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-muted-foreground">Delivery:</span>
          <span className="font-medium">Ksh {Number(order.delivery_fee).toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border mt-2">
          <span className="font-medium">Total:</span>
          <span className="font-bold text-primary">Ksh {Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={approveOrder} disabled={loading} className="flex-1" size="sm" variant="default">
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button onClick={rejectOrder} disabled={loading} className="flex-1" size="sm" variant="destructive">
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>
    </Card>
  )
}
