import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ChatWidget } from "@/components/chat/chat-widget"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"

export default async function PressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderWrapper user={user} profile={profile} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Press</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Media resources and press releases for The Spoonbill restaurant delivery platform.
          </p>

          <div className="space-y-8">
            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-3">Press Releases</h2>
                <p className="text-muted-foreground mb-4">
                  For latest press releases and media inquiries, please contact: press@thethespoonbill
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-3">Media Kit</h2>
                <p className="text-muted-foreground mb-4">
                  Download our brand guidelines, logos, and high-resolution images for media coverage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-3">Contact</h2>
                <p className="text-muted-foreground">
                  Email: sales@thespoonbill.co.ke
                  Phone: +2540112471717
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  )
}
