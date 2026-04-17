"use client"

import { CheckCircle, Circle, Clock } from "lucide-react"

interface OrderStatusTimelineProps {
  order: any
}

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const steps = [
    {
      label: "Order Placed",
      status: "pending",
      completed: true,
      timestamp: order.created_at,
    },
    {
      label: "Accountant Approved",
      status: "confirmed",
      completed: !!order.accountant_approved_at,
      timestamp: order.accountant_approved_at,
    },
    {
      label: "Cooking",
      status: "cooking",
      completed: !!order.cooking_started_at,
      timestamp: order.cooking_started_at,
    },
    {
      label: "Ready for Pickup",
      status: "ready",
      completed: !!order.cooking_completed_at,
      timestamp: order.cooking_completed_at,
    },
    {
      label: "Out for Delivery",
      status: "delivering",
      completed: !!order.delivery_started_at,
      timestamp: order.delivery_started_at,
    },
    {
      label: "Delivered",
      status: "delivered",
      completed: order.status === "delivered" || !!order.rider_delivered_at,
      timestamp: order.rider_delivered_at,
    },
  ]

  const currentStepIndex = steps.findIndex((step) => !step.completed)

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isCompleted = step.completed
        const isCurrent = index === currentStepIndex
        const isPending = index > currentStepIndex

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-500"
                    : isCurrent
                      ? "bg-primary border-primary"
                      : "bg-muted border-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h4
                className={`font-medium ${isCompleted ? "text-foreground" : isPending ? "text-muted-foreground" : "text-primary"}`}
              >
                {step.label}
              </h4>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(step.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {isCurrent && !isCompleted && <p className="text-xs text-primary mt-1 font-medium">In Progress</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
