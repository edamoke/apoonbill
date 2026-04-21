import { createClient } from "@/lib/supabase/server"
import { ChatWidget } from "@/components/chat/chat-widget"
import { ParallaxHero, GridSplit, CenteredForm, MasonryGrid, ElegantQuote, FloatingDishes, HorizontalMenu, SiteFooter, FullWidthParallax, RepeatingBanner } from "@/components/home-sections/home-sections"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { SiteHeader } from "@/components/navigation/site-header"
import { getAllSiteSettings } from "@/app/actions/cms-actions"
import { FONT_COMBINATIONS } from "@/lib/fonts"
import { getTheme } from "@/lib/themes"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from("profiles").select("id, full_name, role, email_confirmed").eq("id", user.id).single()
    : { data: null }

  const settings = await getAllSiteSettings()
  const getSetting = (id: string) => settings.find(s => s.id === id)?.content || null
  const stylesSetting = settings.find(s => s.id === "styles")
  
  const activeTheme = getTheme(stylesSetting?.theme_id)
  const styles = stylesSetting?.content || {}
  const heroSetting = getSetting("hero")
  const branding = heroSetting ? {
    title: heroSetting.title,
    subtitle: heroSetting.subtitle,
    logoUrl: heroSetting.logoUrl
  } : undefined
  
  const fontCombo = FONT_COMBINATIONS.find(c => c.id === (styles.fontComboId || activeTheme.id)) || FONT_COMBINATIONS[0]

  const fontSizeMap: Record<string, string> = {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem'
  }

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${fontCombo.bodyClass} [&_h1]:${fontCombo.headingClass} [&_h2]:${fontCombo.headingClass} [&_h3]:${fontCombo.headingClass} [&_h4]:${fontCombo.headingClass} [&_h5]:${fontCombo.headingClass} [&_h6]:${fontCombo.headingClass}`}
      style={{ 
        color: activeTheme.palette.foreground,
        backgroundColor: styles.backgroundColor || activeTheme.palette.background,
        fontSize: fontSizeMap[styles.fontSize as string] || '1rem',
        ['--primary' as any]: styles.primaryColor || activeTheme.palette.primary,
        ['--secondary' as any]: styles.secondaryColor || activeTheme.palette.secondary,
        ['--accent' as any]: activeTheme.palette.accent,
        ['--foreground' as any]: activeTheme.palette.foreground,
        ['--muted' as any]: activeTheme.palette.muted,
      }}
    >
      {activeTheme.layout.header === 'centered' ? (
        <SiteHeader user={user} profile={profile} theme={activeTheme} branding={branding} />
      ) : (
        <SiteHeaderWrapper user={user} profile={profile} theme={activeTheme} branding={branding} />
      )}
      <ParallaxHero content={getSetting("hero")} theme={activeTheme} />
      <RepeatingBanner image="/kentaaa.jpg" />
      <FloatingDishes theme={activeTheme} />
      <div className="-mt-16 md:-mt-24">
        <FullWidthParallax 
          image="/images/hero-new.png" 
          title="thespoonbill" 
          subtitle="Experience the rich, authentic flavors of African heritage prepared with love and served with elegance."
        />
      </div>
      <RepeatingBanner image="/kentaaa.jpg" reverse={true} />
      <GridSplit content={getSetting("grid_split")} theme={activeTheme} />
      <HorizontalMenu content={getSetting("featured_menu")} theme={activeTheme} />
      <CenteredForm content={getSetting("subscription")} theme={activeTheme} />
      <MasonryGrid theme={activeTheme} />
      <ElegantQuote theme={activeTheme} />
      <SiteFooter content={getSetting("footer")} theme={activeTheme} />
      <ChatWidget />
    </div>
  )
}
