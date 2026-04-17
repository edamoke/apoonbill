"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

interface OrderStatus {
  accountant_approved_at?: string
  chef_started_at?: string
  chef_completed_at?: string
  rider_picked_at?: string
  rider_delivered_at?: string
  status: string
}

interface OrderTrackingCanvasProps {
  order: OrderStatus
}

export function OrderTrackingCanvas({ order }: OrderTrackingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stages = [
    {
      label: "Approved",
      completed: !!order.accountant_approved_at,
      icon: "✓",
      color: "#10b981",
    },
    {
      label: "Cooking",
      completed: !!order.chef_started_at,
      icon: "🍳",
      color: "#f59e0b",
    },
    {
      label: "Ready",
      completed: !!order.chef_completed_at,
      icon: "📦",
      color: "#3b82f6",
    },
    {
      label: "Picked Up",
      completed: !!order.rider_picked_at,
      icon: "🚗",
      color: "#8b5cf6",
    },
    {
      label: "Delivered",
      completed: !!order.rider_delivered_at,
      icon: "🏠",
      color: "#06b6d4",
    },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40
    const usableWidth = width - padding * 2

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Draw connecting line
    const stageWidth = usableWidth / (stages.length - 1)
    const y = height / 2

    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()

    // Draw completed portion of line
    let lastCompletedIndex = -1
    stages.forEach((stage, index) => {
      if (stage.completed) lastCompletedIndex = index
    })

    if (lastCompletedIndex >= 0) {
      const completedEnd = padding + stageWidth * lastCompletedIndex
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(completedEnd, y)
      ctx.stroke()
    }

    // Draw stages
    stages.forEach((stage, index) => {
      const x = padding + stageWidth * index
      const isCompleted = stage.completed

      // Draw circle
      ctx.fillStyle = isCompleted ? stage.color : "#f3f4f6"
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()

      // Draw circle border
      ctx.strokeStyle = isCompleted ? stage.color : "#d1d5db"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw icon/checkmark
      ctx.fillStyle = isCompleted ? "#ffffff" : "#9ca3af"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(stage.icon, x, y)

      // Draw label
      ctx.fillStyle = isCompleted ? stage.color : "#6b7280"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(stage.label, x, y + 40)
    })
  }, [order]) // Updated dependency to only include order

  return (
    <Card className="border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
      <canvas ref={canvasRef} width={600} height={120} className="w-full border border-border rounded-lg" />
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl mb-2 ${stage.completed ? "opacity-100" : "opacity-40"}`}>{stage.icon}</div>
            <p className={`text-xs font-medium ${stage.completed ? "text-foreground" : "text-muted-foreground"}`}>
              {stage.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
