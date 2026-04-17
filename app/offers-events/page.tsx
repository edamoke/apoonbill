import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { CalendarDays, MapPin, Tag, Utensils } from "lucide-react"
import { VenueBookingForm } from "@/components/customer/venue-booking-form"
import { Badge } from "@/components/ui/badge"
import { SiteHeaderWrapper } from "@/components/navigation/site-header-wrapper"
import { ProductCard } from "@/components/product/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function OffersEventsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from("profiles").select("id, full_name, role, email_confirmed").eq("id", user.id).single()
    : { data: null }
  
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .neq("status", "cancelled")
    .order("event_date", { ascending: true })

  const activeEvents = events?.filter(e => e.type === "event")
  const activeOffers = events?.filter(e => e.type === "offer")

  // Fetch products for the menu section
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name")

  const categorizedProducts = {
    breakfast: products?.filter(p => p.slug.includes('breakfast') || p.slug.includes('crepes')) || [],
    'main-meals': products?.filter(p => 
      p.slug.includes('steak') || p.slug.includes('grill') || p.slug.includes('lentil') || 
      p.slug.includes('potatoes-bacon') || p.slug.includes('rice') || p.slug.includes('tilapia') || 
      p.slug.includes('chicken') || p.slug.includes('fish') || p.slug.includes('ugali') || 
      p.slug.includes('legumes')
    ) || [],
    drinks: products?.filter(p => 
      p.slug.includes('drink') || p.slug.includes('beverage') || p.slug.includes('juice') || 
      p.slug.includes('tea') || p.slug.includes('coffee')
    ) || [],
    desserts: products?.filter(p => p.slug.includes('sweet-potato') || p.slug.includes('dessert') || p.slug.includes('chocolate')) || []
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderWrapper user={user} profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-12 space-y-16">
        <section>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Offers & Events</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our latest happenings, live music, and exclusive seasonal offers.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Events Section */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-primary" />
                Upcoming Events
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {activeEvents?.map((event) => (
                  <div key={event.id} className="bg-card rounded-xl overflow-hidden border shadow-sm group">
                    {event.image_url && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <Badge>{event.status}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {event.description}
                      </p>
                      <div className="pt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {event.event_date ? format(new Date(event.event_date), "PPP p") : "TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location || "Main Venue"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!activeEvents || activeEvents.length === 0) && (
                  <p className="text-muted-foreground italic">No upcoming events at the moment.</p>
                )}
              </div>
            </div>

            {/* Offers Section */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" />
                Special Offers
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {activeOffers?.map((offer) => (
                  <div key={offer.id} className="bg-card rounded-xl p-6 border shadow-sm flex gap-4">
                    {offer.image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="font-bold">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {offer.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Limited Time
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!activeOffers || activeOffers.length === 0) && (
                  <p className="text-muted-foreground italic">Check back soon for new offers!</p>
                )}
              </div>
            </div>

            {/* Menu Preview Section */}
            <div className="pt-8">
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-primary" />
                Featured Menu
              </h2>
              <Tabs defaultValue="main-meals" className="w-full">
                <TabsList className="mb-8 overflow-x-auto flex-nowrap max-w-full justify-start h-auto p-1 bg-muted">
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="main-meals">Main Meals</TabsTrigger>
                  <TabsTrigger value="drinks">Drinks</TabsTrigger>
                  <TabsTrigger value="desserts">Desserts</TabsTrigger>
                </TabsList>

                <TabsContent value="breakfast">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {categorizedProducts.breakfast.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="main-meals">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {categorizedProducts['main-meals'].slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="drinks">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {categorizedProducts.drinks.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="desserts">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {categorizedProducts.desserts.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-8">
            <div className="sticky top-24">
              <VenueBookingForm />
              
              <div className="mt-8 bg-muted/50 p-6 rounded-lg border border-dashed text-sm">
                <h4 className="font-bold mb-2">Venue Features:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• High-speed Wi-Fi</li>
                  <li>• Professional Audio/Visual Setup</li>
                  <li>• Catering Packages Available</li>
                  <li>• Dedicated Event Coordinator</li>
                </ul>
              </div>
            </div>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
