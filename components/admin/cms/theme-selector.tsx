"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { THEMES } from "@/lib/themes"
import { updateTheme, getActiveTheme } from "@/app/actions/cms-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null)
  const [updatingTheme, setUpdatingTheme] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeId = await getActiveTheme()
        setActiveThemeId(themeId || "default")
      } catch (error) {
        setActiveThemeId("default")
      } finally {
        setLoading(false)
      }
    }
    loadTheme()
  }, [])

  const handleThemeChange = async (themeId: string) => {
    if (updatingTheme) return
    setUpdatingTheme(true)
    try {
      const result = await updateTheme(themeId)
      if (result.success) {
        setActiveThemeId(themeId)
        toast.success(`Theme updated to ${THEMES[themeId].name}`)
        // Small delay before reload to let toast be seen
        setTimeout(() => {
           window.location.reload()
        }, 1000)
      } else {
        toast.error("Failed to update theme")
        setUpdatingTheme(false)
      }
    } catch (error) {
      toast.error("An error occurred")
      setUpdatingTheme(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.values(THEMES).map((theme) => (
        <Card 
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
          className={cn(
            "relative group cursor-pointer border-2 transition-all hover:shadow-xl overflow-hidden",
            activeThemeId === theme.id 
              ? "border-primary ring-2 ring-primary/20 shadow-lg" 
              : "border-border hover:border-primary/50"
          )}
        >
          <div 
            className="h-32 w-full flex items-center justify-center relative"
            style={{ backgroundColor: theme.palette.background }}
          >
            <div className="flex flex-col items-center gap-2">
              <div 
                className={cn("text-2xl font-bold px-4 text-center", theme.typography.heading)}
                style={{ color: theme.palette.primary }}
              >
                {theme.name}
              </div>
              <div className="flex gap-1">
                 {Object.values(theme.palette).slice(0, 4).map((color, i) => (
                   <div key={i} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                 ))}
              </div>
            </div>
            {activeThemeId === theme.id && (
              <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1 shadow-lg">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          
          <CardHeader className="p-4">
            <CardTitle className="text-lg">{theme.name}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">{theme.description}</CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0 border-t border-border/50 mt-auto bg-muted/30">
             <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <span>Layout Features</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-background border border-border rounded text-[10px] capitalize">{theme.layout.hero} Hero</span>
                  <span className="px-2 py-1 bg-background border border-border rounded text-[10px] capitalize">{theme.layout.header} Nav</span>
                  <span className="px-2 py-1 bg-background border border-border rounded text-[10px] capitalize">{theme.layout.grid} Grid</span>
                </div>
             </div>
          </CardContent>

          {updatingTheme && activeThemeId !== theme.id && (
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
          )}
          {updatingTheme && activeThemeId === theme.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
