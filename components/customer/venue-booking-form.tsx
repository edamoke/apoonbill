"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createBooking } from "@/app/actions/event-actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VenueBookingForm() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await createBooking(formData)
      
      if (result.success) {
        setSubmitted(true)
        toast({
          title: "Booking Requested",
          description: "Your venue booking request has been submitted successfully.",
        })
        event.currentTarget.reset()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="bg-card p-6 rounded-lg border shadow-sm h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-card p-8 rounded-lg border shadow-sm text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif font-bold">Booking Confirmed!</h3>
        <p className="text-muted-foreground">
          Your venue booking request has been received. Our team will review it and get back to you shortly.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Make Another Booking
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h3 className="text-xl font-serif font-bold mb-4">Book a Venue</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="venue_name">Select Venue</Label>
          <Select name="venue_name" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main_lounge">Main Lounge</SelectItem>
              <SelectItem value="garden">Garden Terrace</SelectItem>
              <SelectItem value="private_room">Private Dining Room</SelectItem>
              <SelectItem value="balcony">Balcony Lounge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="booking_date">Date</Label>
            <Input id="booking_date" name="booking_date" type="date" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="guest_count">Number of Guests</Label>
            <Input id="guest_count" name="guest_count" type="number" min="1" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input id="start_time" name="start_time" type="time" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input id="end_time" name="end_time" type="time" required />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="special_requests">Special Requests</Label>
          <Textarea
            id="special_requests"
            name="special_requests"
            placeholder="Any special arrangements or requirements?"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request Booking
        </Button>
      </form>
    </div>
  )
}
