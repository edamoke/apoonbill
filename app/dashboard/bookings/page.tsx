import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: bookings } = await supabase
    .from("venue_bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your venue reservations.</p>
        </div>
        <Button asChild>
          <Link href="/offers-events">New Booking Request</Link>
        </Button>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-border hover:border-primary transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={
                    booking.status === "confirmed" ? "default" :
                    booking.status === "pending" ? "secondary" :
                    booking.status === "completed" ? "outline" : "destructive"
                  } className="capitalize">
                    {booking.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Requested on {format(new Date(booking.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <CardTitle className="text-2xl font-serif capitalize">
                  {booking.venue_name.replace("_", " ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>{format(new Date(booking.booking_date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{booking.start_time} - {booking.end_time}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">
                    thespoonbill Venue
                  </span>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Guests</p>
                  <p className="text-sm">{booking.guest_count} people</p>
                </div>

                {booking.special_requests && (
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Special Requests</p>
                    <p className="text-sm italic text-muted-foreground">"{booking.special_requests}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">You haven't requested any venue reservations yet.</p>
            <Button asChild>
              <Link href="/offers-events">Browse Venues & Offers</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
