"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export function OffersPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [currentOffer, setCurrentOffer] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient()
        
        // Fetch first 3 fries products
        // Check for 'category_id' vs 'category' based on project standard
        const { data: friesData, error: friesError } = await supabase
          .from("products")
          .select("*")
          .ilike("name", "%fries%")
          .limit(3)

        if (friesError) {
          console.error("Fries fetch error:", friesError)
          throw friesError
        }

        // Fetch other products to fill up to 10
        const { data: otherData, error: otherError } = await supabase
          .from("products")
          .select("*")
          .not("name", "ilike", "%fries%")
          .limit(7)

        if (otherError) {
          console.error("Other products fetch error:", otherError)
          throw otherError
        }

        const combinedData = [...(friesData || []), ...(otherData || [])]
        
        if (combinedData.length > 0) {
          setProducts(combinedData)
        }
      } catch (err: any) {
        console.error("Error fetching products for popup:", err?.message || err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!isOpen || loading || products.length === 0) return null

  const product = products[currentOffer]

  // Helper to get category link
  const getCategoryLink = (category?: string) => {
    if (!category) return '/menu'
    const cat = category.toLowerCase()
    if (cat === 'fries') return '/menu?category=fries'
    if (cat === 'burgers') return '/burgers'
    if (cat === 'drinks') return '/drinks'
    if (cat === 'chicken') return '/chicken'
    return `/menu?category=${encodeURIComponent(category)}`
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20 flex flex-col">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
          <img 
            src={
              product.image_url && !product.image_url.includes('placeholder') 
                ? product.image_url 
                : product.category?.toLowerCase() === 'fries'
                  ? `/images/fries${(products.indexOf(product) % 4) + 1}.jpg`
                  : "/images/hero-new.png"
            } 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (product.category?.toLowerCase() === 'fries') {
                target.src = `/images/fries${(products.indexOf(product) % 4) + 1}.jpg`;
              } else {
                target.src = "/images/hero-new.png";
              }
            }}
          />
        </div>

        <div className="p-4 md:p-6 text-center bg-white overflow-hidden flex flex-col items-center">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest mb-2 uppercase">
            Special Offer
          </span>
          <h2 className="text-xl md:text-3xl font-staytion text-slate-900 mb-2 leading-tight">
            {product.name}
          </h2>
          <p className="text-slate-600 mb-3 text-xs line-clamp-1">
            {product.description}
          </p>
          <div className="text-lg md:text-2xl font-black text-primary mb-4">
            Ksh {product.price}
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            <Button asChild className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 text-base rounded-xl shadow-lg border-none">
              <Link href={getCategoryLink(product.category)} onClick={() => setIsOpen(false)}>Order Now</Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setCurrentOffer((prev) => (prev + 1) % products.length)
              }}
              className="text-slate-400 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest"
            >
              See Next Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
