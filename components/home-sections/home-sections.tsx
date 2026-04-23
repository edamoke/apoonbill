"use client"

import { ChefHat, MapPinned, Users, MessageSquare, Info, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { ThemeConfig } from "@/lib/themes"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/dist/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const ICON_MAP: Record<string, any> = {
  ChefHat, MapPinned, Users, MessageSquare, Info
};

export function ParallaxHero({ content, theme }: { content?: any; theme?: ThemeConfig }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current || !bgRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(bgRef.current, {
        yPercent: 30, // Increased parallax intensity
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })

      // Content parallax & fade
      gsap.to(contentRef.current, {
        yPercent: -10,
        opacity: 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })

      // Entrance animation
      const elements = contentRef.current?.querySelectorAll("h2, .btn-group, .badges");
      if (elements && elements.length > 0) {
        gsap.from(elements, {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Use dynamic slides if available, otherwise fallback to exact original static values
  const slides = content?.slides || [
    {
      mainHeading: content?.mainHeading || "The <br />Spoonbill",
      buttonText: content?.buttonText || "START ORDER",
      backgroundImage: content?.backgroundImage || "/images/hero-new.png",
      excellenceText: content?.excellenceText || "Certificate of Excellence",
      choiceText: content?.choiceText || "Travelers' Choice 2024"
    }
  ]

  const title = content?.title || "The Spoonbill"
  const subtitle = content?.subtitle || "Malindi"
  const logoUrl = content?.logoUrl || "/placeholder-logo.svg"

  const navItems = content?.navItems || [
    { label: "MENU", href: "/menu", icon: "ChefHat" },
    { label: "LOCATIONS", href: "#contact", icon: "MapPinned" },
    { label: "CAREERS", href: "#", icon: "Users" },
    { label: "FEEDBACK", href: "#", icon: "MessageSquare" },
    { label: "ABOUT US", href: "#story", icon: "Info" }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [slides.length, nextSlide])

  const heroLayout = theme?.layout.hero || 'parallax';

  return (
    <section 
      ref={heroRef}
      className={cn(
      "relative min-h-[105vh] flex items-center overflow-hidden transition-colors duration-500", // Increased from 85vh to 105vh (approx 20%+)
      heroLayout === 'centered' && "justify-center text-center",
      heroLayout === 'minimal' && "min-h-[75vh]"
    )}>
      {/* Slides */}
      {slides.map((slide: any, index: number) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 z-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Background Image with Parallax Effect */}
          <div 
            ref={index === currentSlide ? bgRef : null}
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url("${slide.backgroundImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Overlay */}
          <div className={cn(
            "absolute inset-0 z-10",
            theme?.id === 'asian' ? "bg-black/40" : "bg-gradient-to-r from-black/60 via-black/30 to-black/70"
          )} />
        </div>
      ))}

      {/* Content */}
      <div 
        ref={contentRef}
        className={cn(
        "container mx-auto px-4 relative z-20 flex flex-col items-center text-white",
        heroLayout === 'parallax' && "md:items-start md:pl-20", // Shifted right with md:pl-20 (approx 15-20 steps)
        heroLayout === 'split' && "md:flex-row md:justify-between",
        heroLayout === 'minimal' && "items-center"
      )}>
        {/* Logo Branding - REMOVED per task request to only appear in menu */}

        {/* Navigation (Vertical Right) */}
        <nav className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50 hidden lg:flex">
          {navItems.map((item: any) => {
            const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] || Info : item.icon;

            return (
              <Link 
                key={item.label} 
                href={item.href}
                className="group flex items-center justify-end gap-3 text-white/80 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
                <Icon className="h-6 w-6" />
              </Link>
            )
          })}
        </nav>

        {/* Slide Content */}
        <div className={cn(
          "max-w-2xl",
          heroLayout === 'centered' && "text-center mx-auto"
        )}>
          <div className="transition-all duration-500 transform translate-y-0 opacity-100">
            <div className="kente-gradient h-2 w-24 mb-6 rounded-full" />
            <h2 
              className={cn(
                "text-5xl md:text-8xl font-staytion mb-8 leading-tight text-white/90", // Bold hero heading
                theme?.typography.heading
              )}
              dangerouslySetInnerHTML={{ __html: slides[currentSlide].mainHeading }}
            />
            
            <div className={cn(
              "flex flex-col gap-6",
              heroLayout === 'centered' && "items-center"
            )}>
              <div className="btn-group">
                <Button 
                  asChild 
                  className={cn(
                    "text-lg font-staytion px-10 py-6 bg-primary text-white hover:opacity-90 transition-all rounded-md", // Larger font and padding for button
                    theme?.id === 'fast-food' ? "rounded-full" : ""
                  )}
                >
                  <Link href="/menu">{slides[currentSlide].buttonText}</Link>
                </Button>
              </div>

              <div className={cn(
                "flex flex-wrap gap-3 badges", // Reduced gap
                heroLayout === 'centered' && "justify-center"
              )}>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-white/80 border border-white/10">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{slides[currentSlide].excellenceText}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-white/80 border border-white/10">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{slides[currentSlide].choiceText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Controls (Optional, visible if more than 1 slide) */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:left-4 md:translate-x-0">
            <Button variant="ghost" size="icon" onClick={prevSlide} className="text-white hover:bg-white/20" title="Previous Slide">
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <div className="flex gap-2">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentSlide ? "bg-white w-4" : "bg-white/40 hover:bg-white/60"
                  )}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={nextSlide} className="text-white hover:bg-white/20" title="Next Slide">
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export function GridSplit({ content, theme }: { content?: any; theme?: ThemeConfig }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const giftCard = content?.giftCard || {
    tag: "BRAND NEW",
    intro: "INTRODUCING",
    title: "THE MOST <br />DELICIOUS GIFT",
    cardText: "thespoonbill Gift Card",
    buttonText: "BUY NOW",
    promoText: "GET & GIFT SOMEONE TODAY"
  };

  const seafoodCard = content?.seafoodCard || {
    tag: "BRAND NEW",
    intro: "FRESH",
    title: "FRESH SEAFOOD",
    image: "/images/pili-pili-prawns.webp"
  };

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(".grid-item", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="py-20 text-slate-900 transition-colors duration-500 relative overflow-hidden" style={{ backgroundColor: '#EBE3D8' }}>
      <div className="absolute top-0 left-0 w-full h-1 kente-gradient opacity-30" />
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          {/* Gift Card */}
          <div 
            className={cn(
              "grid-item rounded-none p-12 flex flex-col justify-between items-start relative overflow-hidden min-h-[500px] transition-all duration-500 shadow-xl kente-border",
              theme?.id === 'pizza' ? "border-4 border-primary bg-transparent" : "bg-secondary"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 kente-pattern opacity-10 -rotate-12 translate-x-12 -translate-y-12" />
            <div>
              <span className="bg-white/90 text-secondary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6 inline-block uppercase">
                {giftCard.tag}
              </span>
              <p className="font-bold tracking-widest mb-2 uppercase italic opacity-80 text-foreground font-staytion">{giftCard.intro}</p>
              <h3 
                className={cn(
                  "text-4xl md:text-5xl font-staytion mb-8 leading-tight text-foreground",
                  theme?.typography.heading
                )}
                dangerouslySetInnerHTML={{ __html: giftCard.title }}
              />
            </div>
          
          <div className="relative z-10 w-full max-w-sm mx-auto my-8">
            <div className={cn(
              "aspect-[1.6/1] rounded-xl shadow-2xl flex items-center justify-center p-8 text-center transition-transform hover:rotate-0 border border-white/10",
              theme?.id === 'fast-food' ? "bg-primary rotate-0" : "bg-gradient-to-r from-primary to-secondary rotate-3"
            )}>
               <span className={cn("text-white text-2xl italic font-staytion", theme?.typography.heading)}>{giftCard.cardText}</span>
            </div>
            <div className="absolute -top-4 -right-4 bg-primary text-white text-[10px] font-bold p-4 rounded-full w-24 h-24 flex items-center justify-center text-center leading-tight rotate-12 shadow-lg border-2 border-white/20">
              {giftCard.promoText}
            </div>
          </div>

          <Button asChild className="bg-primary hover:opacity-90 text-white font-bold px-8 border-none shadow-lg">
            <Link href="/giftcards">{giftCard.buttonText}</Link>
          </Button>
        </div>

        {/* Image Card */}
        <div className="grid-item relative rounded-3xl overflow-hidden min-h-[500px] group border border-border shadow-xl">
          <img 
            src={seafoodCard.image} 
            alt={seafoodCard.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          
          <div className="absolute bottom-12 left-12 z-20 text-white">
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-4 inline-block uppercase border border-white/20">
              {seafoodCard.tag}
            </span>
            <p className="text-white/80 font-bold tracking-widest mb-2 uppercase italic font-staytion">{seafoodCard.intro}</p>
            <h3 className={cn("text-4xl md:text-5xl font-staytion leading-tight", theme?.typography.heading)}>
              {seafoodCard.title}
            </h3>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CenteredForm({ content, theme }: { content?: any; theme?: ThemeConfig }) {
  const [isMounted, setIsMounted] = useState(false)
  const title = content?.title || "Join our email list"
  const disclaimer = content?.disclaimer || "By clicking \"SUBSCRIBE\" I agree to receive news, promotions, information, and offers from The Spoonbill."
  const socials = content?.socials || ["Facebook", "Twitter", "Instagram"]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <section className="bg-background py-24 border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className={cn("text-4xl italic font-staytion mb-12", theme?.typography.heading)}>{title}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8 min-h-[60px]">
            {/* Placeholder to maintain layout during hydration */}
          </div>
          <div className="h-[20px] mb-12" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 border-y border-border bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-3xl text-center text-foreground">
        <h2 className={cn("text-4xl italic font-staytion mb-12 opacity-80 text-foreground", theme?.typography.heading)}>{title}</h2>
        
        <form className="flex flex-col md:flex-row gap-4 mb-8">
          <input 
            type="email" 
            placeholder="Email address" 
            aria-label="Email address"
            className="flex-1 px-6 py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground shadow-inner"
          />
          <Button className="bg-primary hover:opacity-90 text-white font-bold px-8 h-auto border-none shadow-md">
            Subscribe
          </Button>
          <Button variant="outline" className="border-primary text-foreground hover:bg-primary/5 font-bold px-8 h-auto shadow-sm">
            Unsubscribe
          </Button>
        </form>

        <p className="text-sm opacity-60 mb-12 text-foreground">
          {disclaimer}
        </p>

        <div className="flex justify-center gap-8 opacity-50">
          {socials.map((social: string) => (
            <a key={social} href="#" className="hover:opacity-100 transition-colors font-bold tracking-widest text-xs uppercase text-foreground hover:text-primary">
              {social}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function MasonryGrid({ theme }: { theme?: ThemeConfig }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = [
    { src: "/images/pxl-20251209-114620748.jpg", span: "md:col-span-2 md:row-span-2" },
    { src: "/images/pxl-20251209-115126549-20-28custom-29.jpg", span: "" },
    { src: "/images/pxl-20251209-115244688.jpg", span: "" },
    { src: "/images/pxl-20251209-120738148.jpg", span: "" },
    { src: "/images/pxl-20251209-123652576.jpg", span: "" }
  ]

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(".masonry-item", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-24 bg-background transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="text-primary font-bold tracking-[0.3em] uppercase mb-2 font-staytion">Get spoonbill offers</p>
          <h2 className={cn("text-5xl md:text-6xl italic font-staytion", theme?.typography.heading)} style={{ color: '#4D7AFF' }}>10 % off Everyday offers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {items.map((item, idx) => (
            <div 
              key={idx} 
              className={`masonry-item relative overflow-hidden group rounded-lg ${item.span} border border-border shadow-lg`}
            >
              <img 
                src={item.src} 
                alt="Gallery"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className={cn("italic text-white text-lg", theme?.typography.heading)}>View Details</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ElegantQuote({ theme }: { theme?: ThemeConfig }) {
  return (
    <section className="relative py-32 overflow-hidden bg-black text-white shadow-2xl">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url("/images/hero-new.png")',
          backgroundSize: 'cover'
        }}
      />
      <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
        <div className="w-20 h-1 bg-primary mx-auto mb-12" />
        <blockquote className={cn("text-3xl md:text-5xl italic font-staytion leading-tight mb-8", theme?.typography.heading)}>
          "Every meal here is a journey through Kenya's finest culinary traditions, presented with an elegance that matches the warmth of our hospitality."
        </blockquote>
        <cite className="text-primary font-bold tracking-[0.2em] uppercase not-italic">
          — Travel & Leisure Magazine
        </cite>
      </div>
    </section>
  )
}

export function FloatingDishes({ theme }: { theme?: ThemeConfig }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dish1Ref = useRef<HTMLDivElement>(null)
  const dish2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(dish1Ref.current, {
        y: -80,
        rotate: 10,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
      gsap.to(dish2Ref.current, {
        y: -120,
        rotate: -8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-[80vh] flex items-center overflow-hidden py-24">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/images/0421.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="container mx-auto px-4 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <div className="kente-gradient h-1.5 w-24 rounded-full" />
            <h2 className={cn("text-5xl md:text-7xl font-staytion leading-tight", theme?.typography.heading)}>
              Pure Sugarcane <br /> Juice
            </h2>
            <p className="text-xl text-white/80 max-w-lg leading-relaxed">
              Experience nature's nectar with our freshly pressed sugarcane juice, infused with vibrant flavors including Pineapple, Lime, Ginger Lime, Tamarind, Passion, Beetroot, and Beetroot Ginger. Refreshment redefined.
            </p>
            <Button asChild className="bg-primary hover:opacity-90 text-white font-bold px-10 py-6 text-lg h-auto">
              <Link href="https://www.thespoonbill.co.ke/menu?category=drinks">ORDER NOW</Link>
            </Button>
          </div>

          <div className="relative h-[600px] mt-12 md:mt-0">
            <div ref={dish1Ref} className="absolute top-0 -right-12 w-80 h-80 md:w-96 md:h-96 z-20">
              <img src="/images/pxl-20251209-123701932.jpg" alt="Dish 1" className="w-full h-full object-cover rounded-2xl drop-shadow-2xl border-4 border-white" />
            </div>
            <div ref={dish2Ref} className="absolute bottom-0 right-20 w-72 h-72 md:w-80 md:h-80 z-10 opacity-90">
              <img src="/images/pxl-20251209-115244688.jpg" alt="Dish 2" className="w-full h-full object-cover rounded-2xl drop-shadow-2xl border-4 border-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HorizontalMenu({ content, theme }: { content?: any; theme?: ThemeConfig }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const title = content?.title || "Featured Menu"
  const items = content?.items || [
    { title: "Tilapia Large", img: "/images/pxl-20251209-123652576.jpg" },
    { title: "Kuku Choma", img: "/images/pxl-20251209-125043384.jpg" },
    { title: "Pilau", img: "/images/pxl-20251209-114620748.jpg" },
    { title: "Beef Stew", img: "/images/pxl-20251209-120738148.jpg" },
    { title: "Fresh Juice", img: "/images/pxl-20251209-125642606.jpg" },
  ]

  useEffect(() => {
    if (!sectionRef.current || !triggerRef.current) return

    const ctx = gsap.context(() => {
      const totalWidth = sectionRef.current?.scrollWidth || 0;
      const windowWidth = window.innerWidth;
      
      gsap.to(sectionRef.current, {
        x: -(totalWidth - windowWidth),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })
    }, triggerRef)

    return () => ctx.revert()
  }, [])

  const isFriesSection = title.toLowerCase().includes('fries');
  const isFeaturedMenu = title.toLowerCase().includes('featured');

  return (
    <div 
      ref={triggerRef} 
      className={cn(
        "overflow-hidden transition-colors duration-500",
        isFriesSection ? "text-slate-900" : "text-slate-900"
      )} 
      style={{ backgroundColor: isFriesSection ? '#EBE3D8' : '#EBE3D8' }}
    >
      <div className="container mx-auto px-4 pt-20 pb-10">
        <h2 className={cn("text-5xl md:text-7xl font-staytion", theme?.typography.heading)}>{title}</h2>
      </div>
      <div 
        ref={sectionRef} 
        className="flex gap-8 px-4 pb-20 w-fit"
      >
        {items.map((item: any, idx: number) => (
          <div key={idx} className="relative w-[210px] md:w-[315px] aspect-[4/5] flex-shrink-0 group overflow-hidden rounded-2xl">
            <img 
              src={item.img} 
              alt={item.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <h3 className={cn("absolute bottom-10 left-10 text-white text-4xl font-staytion", theme?.typography.heading)}>{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RepeatingBanner({ image, reverse = false }: { image: string, reverse?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !bgRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        xPercent: reverse ? 20 : -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reverse])

  return (
    <section ref={sectionRef} className="relative w-full h-24 md:h-32 overflow-hidden -mt-1 bg-white">
      <div 
        ref={bgRef}
        className={cn(
          "absolute inset-0 w-[200%] h-full",
          reverse ? "-left-[100%]" : "left-0"
        )}
        style={{
          backgroundImage: `url("${image}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'center'
        }}
      />
    </section>
  )
}

export function FullWidthParallax({ image, title, subtitle }: { image: string, title?: string, subtitle?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !bgRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center bg-black">
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 scale-125 pointer-events-none"
        style={{
          backgroundImage: `url("${image}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      <div className="relative z-20 text-center px-4">
        {title && (
          <h2 className="text-5xl md:text-7xl font-kanit font-bold text-white mb-4 drop-shadow-2xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl font-worksans text-white/90 max-w-2xl mx-auto drop-shadow-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-8 kente-gradient h-1 w-32 mx-auto rounded-full" />
      </div>
    </section>
  )
}

export function SiteFooter({ content, theme }: { content?: any; theme?: ThemeConfig }) {
  const location = content?.location || {
    title: "LOCATION",
    lines: ["Next to ACK Church after Barbar,", "Malindi Lamu Road,", "Malindi"]
  };

  const menu = content?.menu || {
    title: "OUR MENU",
    items: [
      { label: "BREAKFAST", href: "/menu?category=breakfast" },
      { label: "DRINKS", href: "/menu?category=drinks" },
      { label: "MAINS", href: "/menu?category=mains" },
      { label: "DESSERTS", href: "/menu?category=desserts" }
    ]
  };

  const contact = content?.contact || {
    title: "CALL US",
    phone: "0748 422 994"
  };

  const copyright = content?.copyright || "© 2025 The Spoonbill. All Rights Reserved"

  return (
    <footer className="py-20 transition-colors duration-500 border-t-8 border-transparent" style={{ backgroundColor: '#A21523', borderImage: "linear-gradient(90deg, var(--kente-red), var(--kente-gold), var(--kente-green), var(--kente-black)) 1" }} id="contact">
      <div className="container mx-auto px-4 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div>
            <h4 className="text-white font-bold tracking-widest mb-8 uppercase border-b border-white/20 pb-2 inline-block">{location.title}</h4>
            <div className="space-y-4">
              {location.lines.map((line: string, i: number) => (
                <p key={i} className="text-white/80 font-medium">{line}</p>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold tracking-widest mb-8 uppercase border-b border-white/20 pb-2 inline-block">{menu.title}</h4>
            <ul className="space-y-4">
              {menu.items.map((item: any) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-white/80 font-medium hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between">
            <div className="text-left md:text-right">
              <h4 className="text-white font-bold tracking-widest mb-4 uppercase">{contact.title}</h4>
              <p className="text-4xl font-serif font-bold text-white shadow-sm inline-block px-2">{contact.phone}</p>
            </div>
            
            <div className="mt-8">
               <h1 className={cn("text-2xl font-staytion text-white", theme?.typography.heading)}>The Spoonbill</h1>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Use", "Contact Us", "Feedback"].map(item => (
              <Link key={item} href="#" className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
            {copyright} By <a href="https://www.linkedin.com/in/eddy-akurwa-0965153a/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-2">Akurwa</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
