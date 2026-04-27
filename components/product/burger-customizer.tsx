"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart"
import { toast } from "@/hooks/use-toast"

interface Patty {
  id: string
  name: string
  price: number
}

const PATTIES: Patty[] = [
  { id: "beef", name: "Beef Patty", price: 250 },
  { id: "chicken", name: "Chicken Patty", price: 300 },
  { id: "fish", name: "Fish Patty", price: 400 },
]

interface Extra {
  id: string
  name: string
  price: number
}

const EXTRAS: Extra[] = [
  { id: "cheese", name: "Extra Cheese", price: 200 },
  { id: "garlic-sauce", name: "Garlic Sauce", price: 50 },
  { id: "1000-island", name: "1000 Island Sauce", price: 50 },
  { id: "garlic-barbecue", name: "Garlic & Barbecue Sauce", price: 150 },
]

const BASE_PRICE = 350 // Base burger price with bun and basic toppings

export function BurgerCustomizer({ theme }: { theme?: any }) {
  const [selectedPatties, setSelectedPatties] = useState<Patty[]>([PATTIES[0]]) // Default 1 beef patty
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([])
  const [totalPrice, setTotalPrice] = useState(BASE_PRICE + PATTIES[0].price)
  const { addItem } = useCart()

  useEffect(() => {
    const pattiesPrice = selectedPatties.reduce((sum, p) => sum + p.price, 0)
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0)
    setTotalPrice(BASE_PRICE + pattiesPrice + extrasPrice)
  }, [selectedPatties, selectedExtras])

  const addPatty = (patty: Patty) => {
    if (selectedPatties.length >= 3) {
      toast({
        title: "Max patties reached",
        description: "You can only add up to 3 patties.",
        variant: "destructive",
      })
      return
    }
    setSelectedPatties([...selectedPatties, patty])
  }

  const removePatty = (index: number) => {
    if (selectedPatties.length <= 1) {
      toast({
        title: "Minimum 1 patty required",
        description: "Your burger needs at least one patty!",
        variant: "destructive",
      })
      return
    }
    const newPatties = [...selectedPatties]
    newPatties.splice(index, 1)
    setSelectedPatties(newPatties)
  }

  const toggleExtra = (extra: Extra) => {
    if (selectedExtras.find((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const handleAddToCart = () => {
    const pattyNames = selectedPatties.map((p) => p.name).join(", ")
    const extraNames = selectedExtras.map((e) => e.name).join(", ")
    const name = `${selectedPatties.length === 1 ? "Single" : selectedPatties.length === 2 ? "Double" : "Triple"} Custom Burger`
    const description = `${pattyNames}${extraNames ? ` with ${extraNames}` : ""}`

    addItem({
      productId: `custom-burger-${Date.now()}`,
      name: name,
      price: totalPrice,
      image_url: "/images/pxl-20251209-114620748.jpg",
    })

    toast({
      title: "Burger added to cart",
      description: `${name} has been added.`,
    })
  }

  return (
    <div className="w-full bg-white/50 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-staytion mb-2 text-foreground">Customize Your Burger</h2>
        <p className="text-muted-foreground italic">Choose your patties (up to 3)</p>
      </div>

      {/* Selected Patties Display */}
      <div className="space-y-3">
        {selectedPatties.map((patty, index) => (
          <div key={index} className="flex items-center justify-between bg-primary/10 p-4 rounded-xl border border-primary/20">
            <span className="font-bold text-foreground">{patty.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removePatty(index)}
              className="text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {selectedPatties.length === 0 && (
          <div className="text-center py-4 text-muted-foreground italic">Add a patty to start</div>
        )}
      </div>

      {/* Patty Selection */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Choose Patties</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PATTIES.map((patty) => (
            <Button
              key={patty.id}
              variant="outline"
              onClick={() => addPatty(patty)}
              disabled={selectedPatties.length >= 3}
              className="flex flex-col h-auto py-4 gap-1 hover:border-primary hover:text-primary transition-all border-dashed"
            >
              <Plus className="h-4 w-4" />
              <span className="font-bold">{patty.name}</span>
              <span className="text-xs opacity-70">Ksh {patty.price}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Extras Selection */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Add Extras</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXTRAS.map((extra) => {
            const isSelected = selectedExtras.some((e) => e.id === extra.id)
            return (
              <Button
                key={extra.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleExtra(extra)}
                className={cn(
                  "flex flex-col h-auto py-3 px-2 gap-1 transition-all text-center leading-tight",
                  isSelected ? "bg-primary text-white border-primary" : "hover:border-primary hover:text-primary border-dashed"
                )}
              >
                <span className="font-bold text-[10px] sm:text-xs">{extra.name}</span>
                <span className={cn("text-[9px] opacity-70", isSelected ? "text-white" : "")}>Ksh {extra.price}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/20">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold text-foreground">Total Price:</span>
          <span className="text-3xl font-staytion text-primary">Ksh {totalPrice}</span>
        </div>
        <Button 
          onClick={handleAddToCart}
          className="w-full py-6 text-lg font-bold bg-primary text-white hover:opacity-90 shadow-lg rounded-xl flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          ADD TO CART
        </Button>
      </div>
    </div>
  )
}
