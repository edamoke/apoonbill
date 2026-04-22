"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const OFFERS = [
  {
    title: "Tilapia Large",
    description: "Freshly caught and prepared to perfection. A local favorite!",
    image: "/images/pxl-20251209-123652576.jpg",
    price: "Ksh 850",
    link: "/menu?category=fresh water fish"
  },
  {
    title: "Kuku Choma",
    description: "Flame-grilled chicken with our signature spices.",
    image: "/images/pxl-20251209-125043384.jpg",
    price: "Ksh 700",
    link: "/menu?category=curries"
  },
  {
    title: "Pure Sugarcane Juice",
    description: "Refreshing and natural. Try our various infusions!",
    image: "/images/pxl-20251209-125642606.jpg",
    price: "Ksh 200",
    link: "/menu?category=ice stone cold ones"
  }
]

export function OffersPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentOffer, setCurrentOffer] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!isOpen) return null

  const offer = OFFERS[currentOffer]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-white transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={offer.image} 
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 text-center bg-white">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest mb-4 uppercase">
            Special Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-staytion text-slate-900 mb-4 leading-tight">
            {offer.title}
          </h2>
          <p className="text-slate-600 mb-6 text-sm">
            {offer.description}
          </p>
          <div className="text-3xl font-bold text-primary mb-8 font-staytion">
            {offer.price}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-primary hover:opacity-90 text-white font-bold py-6 text-lg rounded-xl shadow-lg border-none">
              <Link href={offer.link} onClick={() => setIsOpen(false)}>Order Now</Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setCurrentOffer((prev) => (prev + 1) % OFFERS.length)
              }}
              className="text-slate-400 hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest"
            >
              See Next Offer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
