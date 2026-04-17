"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image_url?: string
    preparation_time?: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisting, setIsWishlisting] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkWishlistStatus()
  }, [product.id])

  async function checkWishlistStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .single()

    setIsInWishlist(!!data)
  }

  const handleToggleWishlist = async () => {
    setIsWishlisting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be logged in to manage your wishlist.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id)

        if (error) throw error
        setIsInWishlist(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({
            user_id: user.id,
            product_id: product.id,
          })

        if (error) throw error
        setIsInWishlist(true)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive",
      })
    } finally {
      setIsWishlisting(false)
    }
  }

  const handleAddToCart = () => {
    setIsAddingToCart(true)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      preparation_time: product.preparation_time,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })

    setTimeout(() => setIsAddingToCart(false), 500)
  }

  return (
    <div className="flex gap-4">
      <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={isAddingToCart}>
        {isAddingToCart ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <ShoppingCart className="mr-2 h-5 w-5" />
        )}
        {isAddingToCart ? "Adding..." : "Add to Cart"}
      </Button>
      <Button 
        size="lg" 
        variant="outline" 
        onClick={handleToggleWishlist}
        disabled={isWishlisting}
        className={cn(
          "transition-colors",
          isInWishlist && "bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:text-red-600"
        )}
      >
        {isWishlisting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
        )}
      </Button>
    </div>
  )
}
