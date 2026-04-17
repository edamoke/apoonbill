import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-serif font-bold tracking-tighter sm:text-5xl">
          Upcoming Events
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Join us for exclusive events, special offers, and memorable experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {events?.map((event) => (
          <Card key={event.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
            {event.image_url && (
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant={event.type === 'offer' ? 'secondary' : 'default'} className="mb-2">
                  {event.type === 'offer' ? 'Special Offer' : 'Event'}
                </Badge>
                {event.price > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        KES {event.price}
                    </Badge>
                ) : (
                    <Badge variant="outline">Free</Badge>
                )}
              </div>
              <CardTitle className="text-xl font-serif">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                {event.event_date && (
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(event.event_date), 'PPP p')}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                )}
              </div>
              <p className="line-clamp-3 text-sm">
                {event.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!events || events.length === 0) && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No upcoming events scheduled at the moment.</p>
        </div>
      )}
    </div>
  );
}
