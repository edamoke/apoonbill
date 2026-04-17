import { createClient } from "@/lib/supabase/server"
import { EventForm } from "@/components/admin/event-form"
import { notFound } from "next/navigation"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const supabase = await createClient()
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Edit Event/Offer</h1>
        <p className="text-muted-foreground">Modify the details of an existing event or offer.</p>
      </div>
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <EventForm initialData={event} />
      </div>
    </div>
  )
}
