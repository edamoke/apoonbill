"use client"

import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ChatWidget } from "@/components/chat/chat-widget"
import { ProductCard } from "@/components/product/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { RepeatingBanner, SiteFooter } from "@/components/home-sections/home-sections"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"

export default function MenuClient({ 
  user, 
  profile, 
  categories, 
  products,
  footerContent
}: { 
  user: any, 
  profile: any, 
  categories: any[], 
  products: any[],
  footerContent?: any
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const defaultCategory = categoryParam || categories?.[0]?.slug || ""

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a]">
      <SiteHeaderWrapper user={user} profile={profile} />

      <main className="pt-0 md:pt-3">
        {/* Categories and Items */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue={defaultCategory} className="w-full">
              {/* Refined Mobile-First Category Selector */}
              <div className="sticky top-[60px] md:top-20 z-40 bg-[#f5f5f5]/90 backdrop-blur-xl py-4 md:py-8 mb-6 md:mb-12 -mx-4 px-4 overflow-hidden group/nav">
                <div className="relative max-w-7xl mx-auto md:px-12">
                  {/* Navigation Buttons - Desktop Only */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/80 shadow-md hover:bg-white text-[#2d5a4a] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300"
                    onClick={() => scroll('left')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-50 rounded-full bg-white/80 shadow-md hover:bg-white text-[#2d5a4a] opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300"
                    onClick={() => scroll('right')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  <div 
                    ref={scrollContainerRef}
                    className="overflow-x-auto no-scrollbar pb-2"
                  >
                    <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap gap-3 md:gap-6 justify-start md:justify-center min-w-max md:min-w-full">
                      {categories?.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.slug}
                          className={cn(
                            "group relative flex flex-col md:flex-col items-center gap-2 md:gap-3 p-0 bg-transparent border-none data-[state=active]:bg-transparent transition-all",
                            "min-w-[80px] md:min-w-[140px]"
                          )}
                        >
                          <div className="h-14 w-14 md:h-24 md:w-24 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white shadow-sm md:shadow-md transition-all duration-300 group-hover:scale-105 md:group-hover:scale-110 group-data-[state=active]:border-red-600 group-data-[state=active]:shadow-lg group-data-[state=active]:ring-4 group-data-[state=active]:ring-red-600/10">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] md:text-base font-bold uppercase tracking-widest text-gray-400 group-data-[state=active]:text-red-600 transition-colors">
                            {category.name}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>
              </div>

              {categories?.map((category) => (
                <TabsContent key={category.id} value={category.slug} className="mt-0 focus-visible:outline-none outline-none">
                  <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-geist font-bold mb-2 md:mb-4 text-[#0A2D4A]">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-500 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-none italic">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                    {products
                      ?.filter((p) => p.category_id === category.id)
                      .map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    {products?.filter((p) => p.category_id === category.id).length === 0 && (
                      <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-xl text-gray-400 font-serif italic">
                          Items for {category.name} are being prepared...
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>

      <SiteFooter content={footerContent} />
      <ChatWidget />
    </div>
  )
}
