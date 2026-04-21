import { CateringRequestForm } from '@/components/customer/catering-request-form';
import { RepeatingBanner, SiteFooter } from '@/components/home-sections/home-sections';
import { SiteHeaderWrapper } from '@/components/navigation/site-header-wrapper';
import { createClient } from '@/lib/supabase/server';
import { getAllSiteSettings } from '@/app/actions/cms-actions';

export default async function CateringPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const settings = await getAllSiteSettings()
  const getSetting = (id: string) => settings.find(s => s.id === id)?.content || null

  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderWrapper user={user} profile={profile} />
      
      <main>
        <section className="py-20 md:py-32 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold mb-8 text-primary">
              Outside Catering Request
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Planning an event? Let us handle the food and equipment. Fill out the form below and we'll send you a quotation.
            </p>
          </div>
        </section>

        <RepeatingBanner image="/images/hero-new.png" />

        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <CateringRequestForm />
          </div>
        </div>
      </main>

      <SiteFooter content={getSetting("footer")} />
    </div>
  );
}
