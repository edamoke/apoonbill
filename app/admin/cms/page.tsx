import { getAllSiteSettings } from "@/app/actions/cms-actions"
import { AdminHeader } from "@/components/admin/admin-header"
import { HeroEditor } from "@/components/admin/cms/hero-editor"
import { FeaturedMenuEditor } from "@/components/admin/cms/featured-menu-editor"
import { GridSplitEditor } from "@/components/admin/cms/grid-editor"
import { FooterEditor } from "@/components/admin/cms/footer-editor"
import { StylesEditor } from "@/components/admin/cms/styles-editor"
import { ThemeSelector } from "@/components/admin/cms/theme-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminCMSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const settings = await getAllSiteSettings()
  const getSetting = (id: string) => settings.find(s => s.id === id)?.content || {}

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-foreground">CMS Management</h1>
            <p className="text-muted-foreground">Manage your front page content, themes, and visual identity</p>
          </div>
        </div>

        <Tabs defaultValue="themes" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="themes" className="rounded-lg">Themes</TabsTrigger>
            <TabsTrigger value="hero" className="rounded-lg">Hero & Logo</TabsTrigger>
            <TabsTrigger value="featured" className="rounded-lg">Featured Menu</TabsTrigger>
            <TabsTrigger value="grid" className="rounded-lg">Grid & Cards</TabsTrigger>
            <TabsTrigger value="footer" className="rounded-lg">Footer</TabsTrigger>
            <TabsTrigger value="styles" className="rounded-lg">Styles</TabsTrigger>
          </TabsList>

          <TabsContent value="themes">
            <ThemeSelector />
          </TabsContent>

          <TabsContent value="hero">
            <HeroEditor initialContent={getSetting("hero")} />
          </TabsContent>

          <TabsContent value="featured">
            <FeaturedMenuEditor initialContent={getSetting("featured_menu")} />
          </TabsContent>

          <TabsContent value="grid">
            <GridSplitEditor initialContent={getSetting("grid_split")} />
          </TabsContent>

          <TabsContent value="footer">
            <FooterEditor initialContent={getSetting("footer")} />
          </TabsContent>

          <TabsContent value="styles">
            <StylesEditor initialContent={getSetting("styles")} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
