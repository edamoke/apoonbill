"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateBookingStatus } from "@/app/actions/event-actions"
import { useRouter } from "next/navigation"

interface BookingStatusSelectorProps {
  bookingId: string
  initialStatus: string
}

export function BookingStatusSelector({ bookingId, initialStatus }: BookingStatusSelectorProps) {
  const router = useRouter()

  const handleStatusChange = async (value: string) => {
    try {
      await updateBookingStatus(bookingId, value as any)
      router.refresh()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  return (
    <Select defaultValue={initialStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="confirmed">Confirmed</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
      </SelectContent>
    </Select>
  )
}
