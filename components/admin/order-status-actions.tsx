"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, ChefHat, Bike, Package, AlertTriangle } from "lucide-react"
import { updateOrderStatus } from "@/app/actions/admin-order-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface OrderStatusActionsProps {
  order: any
  isAdmin?: boolean
  isChef?: boolean
  isRider?: boolean
  isAccountant?: boolean
}

export function OrderStatusActions({ order, isAdmin, isChef, isRider, isAccountant }: OrderStatusActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const handleStatusUpdate = async (status: string, updates: any = {}) => {
    setLoading(true)
    const result = await updateOrderStatus(order.id, status, updates)

    if (result.success) {
      router.refresh()
      setShowCancelDialog(false)
      setCancelReason("")
    } else {
      alert(result.error || "Failed to update order status")
    }

    setLoading(false)
  }

  // Accountant actions
  if (isAccountant && order.status === "pending" && !order.accountant_approved_at) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Review and approve this order to proceed</p>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              handleStatusUpdate("approved", {
                accountant_approved_at: new Date().toISOString(),
                assigned_accountant_id: order.user_id,
              })
            }
            disabled={loading}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Order
          </Button>
          <Button
            onClick={() => handleStatusUpdate("cancelled")}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Reject Order
          </Button>
        </div>
      </div>
    )
  }

  // Chef actions
  if (isChef && ["confirmed", "pending"].includes(order.status)) {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="chef-notes">Chef Notes (Optional)</Label>
          <Textarea
            id="chef-notes"
            placeholder="Add any special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />
        </div>
        <Button
          onClick={() =>
            handleStatusUpdate("cooking", {
              cooking_started_at: new Date().toISOString(),
              assigned_chef_id: order.user_id,
              chef_notes: notes || null,
            })
          }
          disabled={loading}
          className="w-full"
        >
          <ChefHat className="h-4 w-4 mr-2" />
          Start Cooking
        </Button>
      </div>
    )
  }

  if (isChef && order.status === "cooking") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Mark this order as ready when cooking is complete</p>
        <Button
          onClick={() =>
            handleStatusUpdate("ready", {
              cooking_completed_at: new Date().toISOString(),
            })
          }
          disabled={loading}
          className="w-full"
        >
          <Package className="h-4 w-4 mr-2" />
          Mark as Ready
        </Button>
      </div>
    )
  }

  // Rider actions
  if (isRider && order.status === "ready") {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="rider-notes">Rider Notes (Optional)</Label>
          <Textarea
            id="rider-notes"
            placeholder="Add delivery notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />
        </div>
        <Button
          onClick={() =>
            handleStatusUpdate("out_for_delivery", {
              delivery_started_at: new Date().toISOString(),
              assigned_rider_id: order.user_id,
              rider_notes: notes || null,
            })
          }
          disabled={loading}
          className="w-full"
        >
          <Bike className="h-4 w-4 mr-2" />
          Start Delivery
        </Button>
      </div>
    )
  }

  if (isRider && order.status === "out_for_delivery") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Complete delivery and collect customer signature</p>
        <Button onClick={() => handleStatusUpdate("delivered")} disabled={loading} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Complete Delivery
        </Button>
      </div>
    )
  }

  // Admin can perform any action
  if (isAdmin) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Admin controls for order status</p>
        <div className="grid grid-cols-2 gap-2">
          {order.status === "pending" && (
            <Button onClick={() => handleStatusUpdate("approved")} disabled={loading} size="sm">
              Approve Order
            </Button>
          )}
          {["pending", "approved"].includes(order.status) && (
            <Button onClick={() => handleStatusUpdate("cooking")} disabled={loading} size="sm">
              <ChefHat className="h-4 w-4 mr-2" />
              Start Cooking
            </Button>
          )}
          {order.status === "cooking" && (
            <Button onClick={() => handleStatusUpdate("ready")} disabled={loading} size="sm">
              <Package className="h-4 w-4 mr-2" />
              Mark Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button onClick={() => handleStatusUpdate("out_for_delivery")} disabled={loading} size="sm">
              <Bike className="h-4 w-4 mr-2" />
              Start Delivery
            </Button>
          )}
          {order.status === "out_for_delivery" && (
            <Button onClick={() => handleStatusUpdate("delivered")} disabled={loading} size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark Delivered
            </Button>
          )}
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button disabled={loading} variant="destructive" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogDescription>
                  Please provide a reason for cancelling this order. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                <Input
                  id="cancel-reason"
                  placeholder="e.g., Customer changed mind, Out of stock..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate("cancelled", { cancel_reason: cancelReason })}
                  disabled={!cancelReason || loading}
                >
                  {loading ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Management Bypasses & Actions */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-amber-500" /> Administrative Overrides
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-8 font-bold"
              onClick={() => handleStatusUpdate("delivered", { 
                delivered_at: new Date().toISOString(),
                bypass_workflow: true 
              })}
              disabled={loading || order.status === 'delivered'}
            >
              Force Mark Delivered
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-8 font-bold"
              disabled={loading}
            >
              Change Table
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-8 font-bold"
              disabled={loading}
            >
              Split Bill
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] h-8 font-bold"
              disabled={loading}
            >
              Merge Table
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <p className="text-sm text-muted-foreground">No actions available for current status</p>
}
