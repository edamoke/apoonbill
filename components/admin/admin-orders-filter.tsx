"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"

export function AdminOrdersFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const currentStatus = searchParams.get("status") || ""
  const currentType = searchParams.get("type") || ""
  const currentPayment = searchParams.get("payment") || ""
  const currentSearch = searchParams.get("search") || ""
  const currentSource = searchParams.get("source") || ""
  
  const [searchTerm, setSearchTerm] = useState(currentSearch)
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const existingSearch = params.get("search") || ""
    
    if (debouncedSearch === existingSearch) return

    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [debouncedSearch, router, searchParams, pathname])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by customer name or email..." 
            className="pl-10 h-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border">
        {/* Status Filter */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Order Status</p>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!currentStatus ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-[10px] px-2"
              onClick={() => setParam("status", "")}
            >
              All
            </Button>
            {["pending", "processing", "cooking", "ready", "on_transit", "delivered", "cancelled"].map((s) => (
              <Button 
                key={s}
                variant={currentStatus === s ? "default" : "outline"} 
                size="sm" 
                className="h-7 text-[10px] px-2 capitalize"
                onClick={() => setParam("status", s)}
              >
                {s.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Order Type Filter */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Order Type</p>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!currentType ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-[10px] px-2"
              onClick={() => setParam("type", "")}
            >
              All
            </Button>
            {["dine_in", "takeaway", "delivery"].map((t) => (
              <Button 
                key={t}
                variant={currentType === t ? "default" : "outline"} 
                size="sm" 
                className="h-7 text-[10px] px-2 capitalize"
                onClick={() => setParam("type", t)}
              >
                {t.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Method Filter */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Payment</p>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!currentPayment ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-[10px] px-2"
              onClick={() => setParam("payment", "")}
            >
              All
            </Button>
            {["mpesa", "card", "cash", "pay_later"].map((p) => (
              <Button 
                key={p}
                variant={currentPayment === p ? "default" : "outline"} 
                size="sm" 
                className="h-7 text-[10px] px-2 capitalize"
                onClick={() => setParam("payment", p)}
              >
                {p.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Source</p>
          <div className="flex flex-wrap gap-1">
            <Button 
              variant={!currentSource ? "default" : "outline"} 
              size="sm" 
              className="h-7 text-[10px] px-2"
              onClick={() => setParam("source", "")}
            >
              All
            </Button>
            {["web", "pos"].map((src) => (
              <Button 
                key={src}
                variant={currentSource === src ? "default" : "outline"} 
                size="sm" 
                className="h-7 text-[10px] px-2 uppercase"
                onClick={() => setParam("source", src)}
              >
                {src}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
