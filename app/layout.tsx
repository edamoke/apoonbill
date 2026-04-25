import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display, Inter, Cormorant_Garamond, Proza_Libre, Montserrat, Open_Sans, Lora, Merriweather_Sans, Libre_Baskerville, Source_Sans_3, Space_Grotesk, Space_Mono, Roboto, Roboto_Condensed, Syne, Work_Sans, Quicksand, Nunito, Abril_Fatface, Poppins, Josefin_Sans, Lato, Cinzel, Fauna_One, Oswald, Raleway, PT_Serif, PT_Sans, Arvo, Ubuntu, Zilla_Slab, Manrope, Domine, Hind, Playfair_Display_SC, Alice, Fraunces, Karla, Kanit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SmoothScroll } from "@/components/ui/smooth-scroll"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["300", "400", "500", "600", "700"] })
const proza = Proza_Libre({ subsets: ["latin"], variable: "--font-proza", weight: ["400", "500", "600", "700", "800"] })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })
const opensans = Open_Sans({ subsets: ["latin"], variable: "--font-opensans" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const merriweathersans = Merriweather_Sans({ subsets: ["latin"], variable: "--font-merriweathersans" })
const librebaskerville = Libre_Baskerville({ subsets: ["latin"], variable: "--font-librebaskerville", weight: ["400", "700"] })
const sourcesans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sourcesans" })
const spacegrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-spacegrotesk" })
const spacemono = Space_Mono({ subsets: ["latin"], variable: "--font-spacemono", weight: ["400", "700"] })
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["100", "300", "400", "500", "700", "900"] })
const robotocondensed = Roboto_Condensed({ subsets: ["latin"], variable: "--font-robotocondensed" })
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" })
const worksans_new = Work_Sans({ subsets: ["latin"], variable: "--font-worksans" })
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const abril = Abril_Fatface({ subsets: ["latin"], variable: "--font-abril", weight: "400" })
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const josefin = Josefin_Sans({ subsets: ["latin"], variable: "--font-josefin" })
const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["100", "300", "400", "700", "900"] })
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" })
const fauna = Fauna_One({ subsets: ["latin"], variable: "--font-fauna", weight: "400" })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" })
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" })
const ptserif = PT_Serif({ subsets: ["latin"], variable: "--font-ptserif", weight: ["400", "700"] })
const ptsans = PT_Sans({ subsets: ["latin"], variable: "--font-ptsans", weight: ["400", "700"] })
const arvo = Arvo({ subsets: ["latin"], variable: "--font-arvo", weight: ["400", "700"] })
const ubuntu = Ubuntu({ subsets: ["latin"], variable: "--font-ubuntu", weight: ["300", "400", "500", "700"] })
const zillaslab = Zilla_Slab({ subsets: ["latin"], variable: "--font-zillaslab", weight: ["300", "400", "500", "600", "700"] })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })
const domine = Domine({ subsets: ["latin"], variable: "--font-domine" })
const hind = Hind({ subsets: ["latin"], variable: "--font-hind", weight: ["300", "400", "500", "600", "700"] })
const playfairsc = Playfair_Display_SC({ subsets: ["latin"], variable: "--font-playfairsc", weight: ["400", "700", "900"] })
const alice = Alice({ subsets: ["latin"], variable: "--font-alice", weight: "400" })
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" })
const karla = Karla({ subsets: ["latin"], variable: "--font-karla" })
const kanit = Kanit({ subsets: ["latin"], variable: "--font-kanit", weight: ["400", "500", "600", "700", "800", "900"] })

export const metadata: Metadata = {
  title: "Malindi food delivery as an SEO, fastest food delivery, Food delivery, Burgers, Crispy Fries, Garlic fries, Fast food, SEO 2",
  description: "Experience the fastest food delivery in Malindi. The Spoonbill offers the best Burgers, Crispy Fries, Garlic fries, and Fast food. SEO 2 optimized delivery platform.",
  generator: "v0.app",
  icons: {
    icon: "/icon-light-32x32.png",
    apple: "/apple-icon.png",
  },
  metadataBase: new URL('https://thespoonbill.com'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const allFonts = [
    geist, geistMono, playfair, inter, cormorant, proza, montserrat, opensans, lora,
    merriweathersans, librebaskerville, sourcesans, spacegrotesk, spacemono, roboto,
    robotocondensed, syne, worksans_new, quicksand, nunito, abril, poppins, josefin,
    lato, cinzel, fauna, oswald, raleway, ptserif, ptsans, arvo, ubuntu, zillaslab,
    manrope, domine, hind, playfairsc, alice, fraunces, karla, kanit
  ].map(f => f.variable).join(" ")

  return (
    <html lang="en" className={`${allFonts} font-worksans`} suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScroll>
            <div className="pb-20 md:pb-0">
              {children}
            </div>
          </SmoothScroll>
          <MobileBottomNav />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
