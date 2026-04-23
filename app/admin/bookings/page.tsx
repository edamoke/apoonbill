import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BookingStatusSelector } from "@/components/admin/booking-status-selector"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminBookingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single();

  // Try with profiles join first
  const { data: bookings, error } = await supabase
    .from("venue_bookings")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  let finalBookings = bookings
  let finalError = error

  if (error) {
    console.error("Error fetching bookings with default join:", JSON.stringify(error, null, 2))
    
    // Try with explicit relationship hint if default fails
    console.log("Attempting bookings fetch with explicit user_id hint...")
    const { data: hintBookings, error: hintError } = await supabase
      .from("venue_bookings")
      .select(`
        *,
        profiles!venue_bookings_user_id_fkey (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (hintError) {
      console.error("Hint-based join failed too:", JSON.stringify(hintError, null, 2))
      
      // Fallback: Try without join
      console.log("Attempting fallback bookings fetch without join...")
      const { data: simpleBookings, error: simpleError } = await supabase
        .from("venue_bookings")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (simpleError) {
        console.error("Fallback bookings fetch also failed:", JSON.stringify(simpleError, null, 2))
        finalError = simpleError
      } else {
        finalBookings = simpleBookings
        finalError = null
      }
    } else {
      finalBookings = hintBookings
      finalError = null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Venue Bookings</h1>
          <p className="text-muted-foreground">Manage customer venue booking requests.</p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalBookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.profiles?.full_name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{booking.profiles?.email}</div>
                  </TableCell>
                  <TableCell className="capitalize">{booking.venue_name.replace("_", " ")}</TableCell>
                  <TableCell>
                    <div>{format(new Date(booking.booking_date), "PPP")}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </TableCell>
                  <TableCell>{booking.guest_count}</TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === "confirmed" ? "default" :
                      booking.status === "pending" ? "secondary" :
                      booking.status === "completed" ? "outline" : "destructive"
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BookingStatusSelector 
                      bookingId={booking.id} 
                      initialStatus={booking.status} 
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!finalBookings || finalBookings.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No venue bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
