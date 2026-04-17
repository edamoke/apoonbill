"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette, Check, Loader2 } from "lucide-react"
import { THEMES } from "@/lib/themes"
import { updateTheme, getActiveTheme } from "@/app/actions/cms-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminThemesPage() {
  const [activeThemeId, setActiveThemeId] = useState("default")
  const [updatingTheme, setUpdatingTheme] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      const themeId = await getActiveTheme()
      setActiveThemeId(themeId)
      setLoading(false)
    }
    loadTheme()
  }, [])

  const handleThemeChange = async (themeId: string) => {
    setUpdatingTheme(true)
    try {
      const result = await updateTheme(themeId)
      if (result.success) {
        setActiveThemeId(themeId)
        toast.success(`Theme updated to ${THEMES[themeId].name}`)
      } else {
        toast.error("Failed to update theme")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setUpdatingTheme(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Themes</h1>
        <p className="text-muted-foreground">Select a visual personality for your restaurant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(THEMES).map((theme) => (
          <Card 
            key={theme.id}
            onClick={() => !updatingTheme && handleThemeChange(theme.id)}
            className={cn(
              "relative group cursor-pointer border-2 transition-all hover:shadow-xl overflow-hidden",
              activeThemeId === theme.id 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            <div 
              className="h-32 w-full flex items-center justify-center relative"
              style={{ backgroundColor: theme.palette.background }}
            >
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={cn("text-2xl font-bold", theme.typography.heading)}
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
              <CardDescription className="text-xs">{theme.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0 border-t border-border/50 mt-auto bg-muted/30">
               <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Layouts</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-background border border-border rounded text-[10px]">{theme.layout.hero} Hero</span>
                    <span className="px-2 py-1 bg-background border border-border rounded text-[10px]">{theme.layout.header} Nav</span>
                  </div>
               </div>
            </CardContent>

            {updatingTheme && activeThemeId !== theme.id && (
              <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
