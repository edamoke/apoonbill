import { EventForm } from "@/components/admin/event-form"

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">New Event/Offer</h1>
        <p className="text-muted-foreground">Create a new event or special offer.</p>
      </div>
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <EventForm />
      </div>
    </div>
  )
}
