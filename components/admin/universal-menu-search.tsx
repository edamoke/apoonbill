"use client"

import { useState, useEffect } from "react"
import { Search, UtensilsCrossed, ArrowRight, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function UniversalMenuSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        setLoading(true)
        const { data } = await supabase
          .from("menu_items")
          .select("id, name, price, menu_categories(name)")
          .ilike("name", `%${query}%`)
          .limit(5)
        setResults(data || [])
        setLoading(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Menu Items (Universal)..."
          className="pl-10 h-10 bg-muted/50 border-none focus-visible:ring-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 p-2 shadow-xl border-primary/10">
          <div className="space-y-1">
            {results.map((item) => (
              <Link 
                key={item.id} 
                href={`/admin/products/${item.id}`}
                onClick={() => setQuery("")}
              >
                <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.menu_categories?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">KES {item.price}</p>
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
