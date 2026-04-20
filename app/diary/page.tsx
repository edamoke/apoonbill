import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ChatWidget } from "@/components/chat/chat-widget"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DiaryPage() {
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
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Our Diary</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Stories, insights, and updates from the The Spoonbill kitchen and community.
          </p>

          <div className="space-y-8">
            <Card className="border-border bg-card hover:border-primary transition-all group">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">
                  Celebrating Local Ingredients
                </h2>
                <p className="text-muted-foreground text-sm mb-4">December 15, 2024</p>
                <p className="text-muted-foreground mb-4">
                  We're committed to sourcing the freshest ingredients from local suppliers. Learn about our journey to
                  sustainable dining.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:border-primary transition-all group">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">Meet Our Chef</h2>
                <p className="text-muted-foreground text-sm mb-4">December 8, 2024</p>
                <p className="text-muted-foreground mb-4">
                  An exclusive interview with Chef James about his culinary journey and what inspires his signature
                  dishes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:border-primary transition-all group">
              <CardContent className="p-8">
                <h2 className="text-2xl font-serif mb-2 group-hover:text-primary transition-colors">New Menu Launch</h2>
                <p className="text-muted-foreground text-sm mb-4">December 1, 2024</p>
                <p className="text-muted-foreground mb-4">
                  Exciting new dishes have arrived on our menu, featuring seasonal favorites and customer-requested
                  items.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">More stories coming soon. Subscribe to stay updated.</p>
            <Button variant="outline">Subscribe to Diary</Button>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  )
}
