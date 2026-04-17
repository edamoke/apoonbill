"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Lock, Palette, Check, ShieldCheck, Monitor } from "lucide-react"
import { EtimsSettingsCard } from "@/components/admin/settings/etims-settings-card"
import { MpesaSettingsCard } from "@/components/admin/settings/mpesa-settings-card"
import { ReceiptSettingsCard } from "@/components/admin/settings/receipt-settings-card"
import { THEMES } from "@/lib/themes"
import Link from "next/link"
import { updateTheme, getActiveTheme } from "@/app/actions/cms-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeThemeId, setActiveThemeId] = useState("default")
  const [updatingTheme, setUpdatingTheme] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        redirect("/auth/login")
      }

      setUser(authUser)

      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      const isAllowed = 
        userProfile?.is_admin || 
        userProfile?.role === "admin" ||
        userProfile?.is_accountant || 
        userProfile?.role === "accountant"

      if (!isAllowed) {
        redirect("/dashboard")
      }

      setProfile(userProfile)
      
      const themeId = await getActiveTheme()
      setActiveThemeId(themeId)
      
      setLoading(false)
    }

    checkAuth()
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

  if (loading || !user || !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif mb-2 text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant settings and preferences</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Access to Sub-settings */}
          <Link href="/admin/settings/access-control">
            <Card className="border-border shadow-sm hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Access Control</CardTitle>
                  <CardDescription>Manage roles and permissions</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/settings/pos">
            <Card className="border-border shadow-sm hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">POS Settings</CardTitle>
                  <CardDescription>Configure terminal and hardware</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          {/* Theme Selector */}
          <Card className="border-border shadow-sm md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Restaurant Themes</CardTitle>
              </div>
              <CardDescription>
                Select a visual theme optimized for your restaurant niche. This will update colors, fonts, and layouts site-wide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(THEMES).map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => !updatingTheme && handleThemeChange(theme.id)}
                    className={cn(
                      "relative group cursor-pointer rounded-2xl border-2 p-4 transition-all hover:shadow-md",
                      activeThemeId === theme.id 
                        ? "border-[var(--primary)] bg-[var(--primary)]/5" 
                        : "border-border hover:border-muted-foreground/50"
                    )}
                    style={{ '--primary': theme.palette.primary } as any}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg">{theme.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                      </div>
                      {activeThemeId === theme.id && (
                        <div className="bg-[var(--primary)] text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      {Object.entries(theme.palette).slice(0, 4).map(([key, color]) => (
                        <div 
                          key={key} 
                          className="h-6 w-6 rounded-full border border-black/10 shadow-sm" 
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      <div className={cn("text-xs font-bold", theme.typography.heading)}>Heading Preview</div>
                      <div className={cn("text-[10px]", theme.typography.body)}>Body text preview for this theme.</div>
                    </div>

                    {updatingTheme && activeThemeId !== theme.id && (
                      <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] rounded-2xl" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Restaurant Name</label>
                <p className="text-sm text-muted-foreground mt-1">Mama Jos</p>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm text-muted-foreground mt-1">Nairobi, Kenya</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent rounded-xl">
                Edit Settings
              </Button>
            </CardContent>
          </Card>

          {/* M-Pesa Settings */}
          <MpesaSettingsCard />

          {/* eTIMS Settings */}
          <EtimsSettingsCard />

          {/* Security Settings */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent rounded-xl">
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Receipt Settings */}
          <ReceiptSettingsCard />
        </div>
      </main>
    </div>
  )
}
