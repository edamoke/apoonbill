"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, DollarSign, User, Phone, Mail } from "lucide-react"
import { useState } from "react"
import { approveOrder, rejectOrder } from "@/app/actions/accountant-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AccountantOrderCardProps {
  order: any
}

export function AccountantOrderCard({ order }: AccountantOrderCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await approveOrder(order.id)
      if (result.success) {
        toast.success("Order approved successfully!")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to approve order")
      }
    } catch (error) {
      toast.error("An error occurred while approving the order")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const result = await rejectOrder(order.id)
      if (result.success) {
        toast.success("Order rejected")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to reject order")
      }
    } catch (error) {
      toast.error("An error occurred while rejecting the order")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Card className="border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            <Clock className="h-3 w-3 mr-1" />
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.profiles?.full_name || "Customer"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{order.profiles?.email}</span>
          </div>
          {order.profiles?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{order.profiles.phone}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Items</span>
            <span className="text-sm font-medium">{order.order_items?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Payment Method</span>
            <Badge variant="outline" className="text-xs capitalize">
              {order.payment_method}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-medium flex items-center gap-1">
              Total
            </span>
            <span className="text-xl font-bold text-primary">Ksh {Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={handleReject}
            disabled={isRejecting || isApproving}
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
          >
            {isRejecting ? (
              "Rejecting..."
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </>
            )}
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isApproving ? (
              "Approving..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
