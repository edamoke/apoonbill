"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pen, RotateCcw, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SignatureCaptureProps {
  orderId: string
}

export function SignatureCapture({ orderId }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 300

    // Set drawing style
    context.strokeStyle = "#000000"
    context.lineWidth = 2
    context.lineCap = "round"
    context.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    setIsDrawing(true)
    setHasSignature(true)

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const completeDelivery = async () => {
    if (!hasSignature || !customerName.trim()) {
      alert("Please provide customer name and signature")
      return
    }

    setLoading(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      // Convert canvas to base64
      const signatureData = canvas.toDataURL("image/png")

      const supabase = createClient()

      // Update order status
      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivery_completed_at: new Date().toISOString(),
          delivery_signature_data: signatureData,
          customer_signature_name: customerName,
          delivery_notes: deliveryNotes || null,
        })
        .eq("id", orderId)

      if (error) throw error

      // Redirect to deliveries page
      router.push("/admin/deliveries")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error completing delivery:", error)
      alert("Failed to complete delivery. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-serif font-bold mb-2">Customer Signature</h2>
        <p className="text-sm text-muted-foreground">Ask the customer to sign below to confirm delivery</p>
      </div>

      {/* Customer Name Input */}
      <div className="space-y-2">
        <Label htmlFor="customer-name">Customer Name *</Label>
        <Input
          id="customer-name"
          placeholder="Enter customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      {/* Signature Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Signature *</Label>
          <Button type="button" variant="ghost" size="sm" onClick={clearSignature} disabled={!hasSignature}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
        <div className="border-2 border-dashed border-border rounded-lg bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault()
              startDrawing(e)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              draw(e)
            }}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Pen className="h-4 w-4" />
          <span>Draw your signature above using your finger or mouse</span>
        </div>
      </div>

      {/* Delivery Notes */}
      <div className="space-y-2">
        <Label htmlFor="delivery-notes">Delivery Notes (Optional)</Label>
        <Textarea
          id="delivery-notes"
          placeholder="Add any delivery notes or observations..."
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={completeDelivery}
        disabled={loading || !hasSignature || !customerName.trim()}
        className="w-full"
        size="lg"
      >
        <Check className="h-5 w-5 mr-2" />
        {loading ? "Completing Delivery..." : "Complete Delivery"}
      </Button>
    </Card>
  )
}
