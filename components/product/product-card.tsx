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
    <Card className="border-0 bg-white rounded-[2rem] hover:shadow-2xl transition-all duration-500 group h-full overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden shrink-0">
        <div className="aspect-[4/5] bg-[#f9f9f9] overflow-hidden">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {product.spice_level > 0 && (
            <span className="bg-white/90 backdrop-blur-md text-[#d62828] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
              {"🌶️".repeat(product.spice_level)}
            </span>
          )}
          {product.is_vegetarian && (
            <span className="bg-white/90 backdrop-blur-md text-green-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
              Veg
            </span>
          )}
        </div>
      </Link>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-xl font-serif font-bold text-[#0A2D4A] mb-1 group-hover:text-[#d62828] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs leading-snug line-clamp-2 italic">
            {product.description}
          </p>
        </div>
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100">
          <div>
            <span className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Price</span>
            <span className="text-2xl font-serif font-bold text-[#0A2D4A]">
              {product.price === 0 ? "FREE" : `Ksh ${product.price}`}
            </span>
          </div>
          <AddToCartButton product={{
            ...product,
            image_url: product.image_url ?? undefined
          }} />
        </div>
      </CardContent>
    </Card>
  )
}
