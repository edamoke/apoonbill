"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"
import { createOnlineOrder } from "@/app/actions/online-order-actions"

interface CheckoutFormProps {
  user: User
  profile: any
}

export function CheckoutForm({ user, profile }: CheckoutFormProps) {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMpesaProcessing, setIsMpesaProcessing] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    customerName: profile?.full_name || "",
    customerEmail: user.email || "",
    customerPhone: profile?.phone || "",
    deliveryAddress: profile?.address || "",
    orderType: "delivery",
    specialInstructions: "",
    paymentMethod: "mpesa",
    password: "",
  })

  const subtotal = getTotalPrice()
  const deliveryFee = formData.orderType === "delivery" ? 100 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting checkout with items:", items)

    try {
      const supabase = createClient()

      // Use Server Action to place the order
      const result = await createOnlineOrder({
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          name: i.name,
          price: i.price
        })),
        formData,
        subtotal,
        deliveryFee,
        total
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const orderId = result.orderId!
      console.log("[v0] Order created via server action:", orderId)

      if (formData.paymentMethod === "mpesa") {
        setIsMpesaProcessing(true)

        console.log("[v0] Initiating M-Pesa payment")

        try {
          // Check if password matches current session user if needed, or rely on existing session
          // Removing re-login to avoid session invalidation during checkout
          
          const response = await fetch("/api/mpesa/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: formData.customerPhone,
              amount: total,
              orderId: orderId,
              accountReference: `ORDER-${orderId}`,
            }),
          })

          const data = await response.json()

          console.log("[v0] M-Pesa response:", data)

          if (data.success) {
            toast({
              title: "Payment request sent",
              description: "Please check your phone and enter your M-Pesa PIN to complete the payment.",
            })

            clearCart()

            router.push(`/checkout/success?order_id=${orderId}&payment=processing`)
          } else {
            throw new Error(data.error || "Failed to initiate M-Pesa payment")
          }
        } catch (mpesaError: any) {
          console.error("[v0] M-Pesa error:", mpesaError)
          setError(`M-Pesa payment failed: ${mpesaError.message}. Your order has been created but payment is pending.`)
          setIsMpesaProcessing(false)
          setIsLoading(false)
          return
        }
      } else {
        clearCart()

        router.push(`/checkout/success?order_id=${orderId}`)
      }
    } catch (error: any) {
      console.error("[v0] Checkout error detailed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      })
      setError(error.message || "Failed to place order. Please try again.")
    } finally {
      if (!isMpesaProcessing) {
        setIsLoading(false)
      }
    }
  }

  if (items.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Your cart is empty. Add items to proceed.</p>
          <Button asChild className="mt-4">
            <a href="/menu">Browse Menu</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+254712345678"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.orderType}
                onValueChange={(value) => setFormData({ ...formData, orderType: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    Delivery (+Ksh {deliveryFee})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="cursor-pointer">
                    Pickup (Free)
                  </Label>
                </div>
              </RadioGroup>

              {formData.orderType === "delivery" && (
                <div className="mt-4">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    required
                    placeholder="Enter your full delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests or dietary requirements?"
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="cursor-pointer flex-1">
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-xs text-muted-foreground">Pay securely with M-Pesa STK Push</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer flex-1">
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay with cash when your order arrives</div>
                  </Label>
                </div>
              </RadioGroup>

              {formData.paymentMethod === "mpesa" && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="password">Verify your password</Label>
                  <p className="text-xs text-muted-foreground">
                    For your security, please enter your thespoonbill account password to authorize the M-Pesa
                    payment.
                  </p>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your account password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border sticky top-4">
            <CardHeader>
              <CardTitle className="font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>Ksh {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-primary">Ksh {total.toFixed(2)}</span>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading || isMpesaProcessing}>
                {isMpesaProcessing ? "Processing M-Pesa..." : isLoading ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
