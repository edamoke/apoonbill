"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, User, Package, FileCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface DeliveryOrderCardProps {
  order: any
  status: "ready" | "delivering"
}

export function DeliveryOrderCard({ order, status }: DeliveryOrderCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const startDelivery = async () => {
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    await supabase
      .from("orders")
      .update({
        status: "delivering",
        delivery_started_at: new Date().toISOString(),
        assigned_rider_id: user?.id,
      })
      .eq("id", order.id)
    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
          <Badge variant="secondary" className="mt-1">
            Ksh {Number(order.total).toFixed(2)}
          </Badge>
        </div>
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-medium">{order.profiles?.full_name || "Guest"}</p>
            <p className="text-muted-foreground">{order.profiles?.email}</p>
          </div>
        </div>

        {order.profiles?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${order.profiles.phone}`} className="text-primary hover:underline">
              {order.profiles.phone}
            </a>
          </div>
        )}

        {order.profiles?.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-muted-foreground">{order.profiles.address}</p>
          </div>
        )}

        {order.delivery_instructions && (
          <p className="text-xs bg-secondary/50 p-2 rounded">Note: {order.delivery_instructions}</p>
        )}
      </div>

      <div className="pt-2 space-y-2">
        {status === "ready" && (
          <Button onClick={startDelivery} disabled={loading} className="w-full" size="sm">
            Start Delivery
          </Button>
        )}
        {status === "delivering" && (
          <>
            <Button asChild className="w-full" size="sm" variant="default">
              <Link href={`/admin/deliveries/${order.id}/complete`}>
                <FileCheck className="h-4 w-4 mr-2" />
                Complete Delivery
              </Link>
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
