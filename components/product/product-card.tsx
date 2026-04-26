"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image_url: string | null
  preparation_time: number
  spice_level: number
  is_vegetarian: boolean
  is_vegan: boolean
}

export function ProductCard({ product }: { product: Product }) {
  // Use Pollinations AI to generate high-quality food images if no image is available
  const aiPrompt = encodeURIComponent(`Professional food photography of ${product.name}, ${product.description}, high resolution, 8k, highly detailed, gourmet presentation, studio lighting`);
  const displayImage = product.image_url || `https://image.pollinations.ai/prompt/${aiPrompt}?width=800&height=1000&nologo=true&seed=${product.id.split('-')[0]}`

  return (
    <Card className="border-0 bg-white rounded-[1.5rem] md:rounded-[2rem] hover:shadow-2xl transition-all duration-500 group h-full overflow-hidden flex flex-col shadow-sm">
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden shrink-0">
        <div className="aspect-[1/1] md:aspect-[4/5] bg-[#f9f9f9] overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        <div className="absolute top-2 left-2 md:top-6 md:left-6 flex flex-col gap-1 md:gap-2">
          {product.spice_level > 0 && (
            <span className="bg-white/90 backdrop-blur-md text-[#d62828] px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-sm flex items-center gap-1">
              {"🌶️".repeat(product.spice_level)}
            </span>
          )}
          {product.is_vegetarian && (
            <span className="bg-white/90 backdrop-blur-md text-green-600 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold shadow-sm">
              Veg
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-3 md:p-6 flex-1 flex flex-col">
        <div className="mb-2 md:mb-3">
          <h3 className="text-sm md:text-xl font-geist font-bold text-[#0A2D4A] mb-0.5 md:mb-1 group-hover:text-red-600 transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-400 text-[10px] md:text-xs leading-tight md:leading-snug line-clamp-2 italic">
            {product.description}
          </p>
        </div>
        
        <div className="mt-auto pt-2 md:pt-6 flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="hidden md:block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Price</span>
            <span className="text-base md:text-2xl font-bold text-red-600 md:text-[#0A2D4A]">
              {product.price === 0 ? "FREE" : `Ksh ${product.price}`}
            </span>
          </div>
          <div className="w-full md:w-auto">
            <AddToCartButton product={{
              ...product,
              image_url: product.image_url ?? undefined
            }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
