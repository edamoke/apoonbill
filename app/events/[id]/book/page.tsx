import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EventBookingForm } from "@/components/events/event-booking-form";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default async function EventBookingPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Fetch menu products for pre-order
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('category_id');

  // Fetch menu categories to organize the menu
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .order('sort_order');

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Link href={`/events/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Event Details
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Book Your Spot</h1>
            <p className="text-muted-foreground">
                {event.title} - {new Date(event.event_date).toLocaleDateString()}
            </p>
        </div>
        
        <EventBookingForm 
            event={event} 
            products={products || []} 
            categories={categories || []} 
        />
      </div>
    </div>
  );
}
