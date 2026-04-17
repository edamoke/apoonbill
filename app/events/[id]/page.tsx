import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft, Ticket } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    console.error('Error fetching event:', error);
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
            <Badge 
                variant={event.type === 'offer' ? 'secondary' : 'default'} 
                className="absolute top-4 left-4"
            >
              {event.type === 'offer' ? 'Special Offer' : 'Event'}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">{event.title}</h1>
            <div className="flex flex-col space-y-2 text-muted-foreground mt-4">
              {event.event_date && (
                <div className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  {format(new Date(event.event_date), 'PPP p')}
                </div>
              )}
              {event.location && (
                <div className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  {event.location}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="prose prose-stone dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">About this event</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          <Separator />

          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground block">Ticket Price</span>
                <span className="text-2xl font-bold">
                    {event.price > 0 ? `KES ${event.price}` : 'Free'}
                </span>
              </div>
              <div className="text-right">
                 {event.capacity && (
                    <span className="text-sm text-muted-foreground block">
                        Capacity: {event.capacity}
                    </span>
                 )}
              </div>
            </div>
            
            <Button size="lg" className="w-full" asChild>
                <Link href={`/events/${event.id}/book`}>
                    <Ticket className="mr-2 h-4 w-4" />
                    Book Now
                </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
                You can pre-order food and drinks in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
