"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface OrderStatus {
  accountant_approved_at?: string
  cooking_started_at?: string
  chef_started_at?: string
  cooking_completed_at?: string
  chef_completed_at?: string
  delivery_started_at?: string
  rider_picked_at?: string
  rider_delivered_at?: string
  status: string
}

interface OrderTrackingCanvasProps {
  order: OrderStatus
}

export function OrderTrackingCanvas({ order }: OrderTrackingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(undefined)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)

  const stages = [
    {
      label: "Approved",
      completed: !!order.accountant_approved_at || ["confirmed", "preparing", "ready", "out_for_delivery", "delivered"].includes(order.status),
      icon: "✓",
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
    },
    {
      label: "Cooking",
      completed: !!(order.cooking_started_at || order.chef_started_at) || ["preparing", "ready", "out_for_delivery", "delivered", "cooking"].includes(order.status),
      icon: "🍳",
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      label: "Ready",
      completed: !!(order.cooking_completed_at || order.chef_completed_at) || ["ready", "out_for_delivery", "delivered"].includes(order.status),
      icon: "📦",
      color: "#3b82f6",
      gradient: ["#3b82f6", "#2563eb"],
    },
    {
      label: "Picked Up",
      completed: !!(order.delivery_started_at || order.rider_picked_at) || ["out_for_delivery", "delivered"].includes(order.status),
      icon: "🚗",
      color: "#8b5cf6",
      gradient: ["#8b5cf6", "#7c3aed"],
    },
    {
      label: "Delivered",
      completed: order.status === "delivered" || !!order.rider_delivered_at,
      icon: "🎉",
      color: "#06b6d4",
      gradient: ["#06b6d4", "#0891b2"],
    },
  ]

  const getCurrentStage = () => {
    return stages.findIndex((s, i) => {
      if (i === stages.length - 1) return s.completed
      return s.completed && !stages[i + 1].completed
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = 60
    const usableWidth = width - padding * 2
    const stageWidth = usableWidth / (stages.length - 1)
    const y = height / 2

    let animationTime = 0
    const currentStage = getCurrentStage()

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      animationTime += 0.02

      // Draw background - White as per the image
      ctx.fillStyle = "#f8fafc"
      ctx.fillRect(0, 0, width, height)

      // Draw base connection line
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // Draw completed portion
      let lastCompletedIndex = -1
      stages.forEach((stage, index) => {
        if (stage.completed) lastCompletedIndex = index
      })

      if (lastCompletedIndex >= 0) {
        const completedEnd = padding + stageWidth * lastCompletedIndex
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 6
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(completedEnd, y)
        ctx.stroke()
      }

      // Draw stages
      stages.forEach((stage, index) => {
        const x = padding + stageWidth * index
        const isCompleted = stage.completed
        const isActive = index === currentStage
        const isHovered = index === hoveredStage

        let radius = 24
        if (isActive) {
          radius = 24 + Math.sin(animationTime * 3) * 3
        }

        // Glow for active stage
        if (isActive) {
          const glowRadius = radius + 8 + Math.sin(animationTime * 2) * 4
          const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, glowRadius)
          glowGradient.addColorStop(0, `${stage.color}40`)
          glowGradient.addColorStop(1, `${stage.color}00`)
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Circle
        if (isCompleted) {
          ctx.fillStyle = stage.color
        } else {
          ctx.fillStyle = "#f1f5f9"
        }

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()

        // Border
        ctx.strokeStyle = isCompleted ? "#ffffff" : "#cbd5e1"
        ctx.lineWidth = 3
        ctx.stroke()

        // Icon
        ctx.save()
        ctx.translate(x, y)
        ctx.fillStyle = isCompleted ? "#ffffff" : "#94a3b8"
        ctx.font = "bold 18px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(stage.icon, 0, 0)
        ctx.restore()

        // Label
        ctx.fillStyle = isCompleted ? stage.color : "#64748b"
        ctx.font = `600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        ctx.textAlign = "center"
        ctx.fillText(stage.label, x, y + 48)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let foundHover: number | null = null
      stages.forEach((stage, index) => {
        const x = padding + stageWidth * index
        const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2))
        if (distance < 30) {
          foundHover = index
        }
      })
      setHoveredStage(foundHover)
      canvas.style.cursor = foundHover !== null ? "pointer" : "default"
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [order, hoveredStage])

  return (
    <Card className="border-border bg-[#111111] p-6 overflow-hidden">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
        <span className="text-2xl">📍</span>
        Order Progress Tracker
      </h3>
      <div className="bg-white rounded-lg p-4">
        <canvas ref={canvasRef} style={{ width: "100%", height: "140px" }} className="rounded-lg" />
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <div key={index} className="text-center">
            <div className={`text-3xl mb-2 ${stage.completed ? "opacity-100" : "opacity-40"}`}>{stage.icon}</div>
            <p className={`text-xs font-semibold ${stage.completed ? "text-white" : "text-gray-500"}`}>
              {stage.label}
            </p>
            {stage.completed && <div className="mt-1 text-[10px] text-gray-400">✓ Complete</div>}
          </div>
        ))}
      </div>
    </Card>
  )
}
