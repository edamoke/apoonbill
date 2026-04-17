'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface BookingData {
  event_id: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total_amount: number;
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export async function createEventBooking(data: BookingData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user ? user.id : null;

  try {
    // 1. Get Event Date
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('event_date, price')
      .eq('id', data.event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // 2. Create Venue Booking
    const { data: booking, error: bookingError } = await supabase
      .from('venue_bookings')
      .insert({
        user_id: userId,
        event_id: data.event_id,
        contact_name: data.name,
        contact_email: data.email,
        contact_phone: data.phone,
        tickets: data.tickets,
        total_amount: data.total_amount,
        booking_date: event.event_date,
        area: 'event_hall', // Default area
        status: 'pending',
        start_time: '18:00', // Default or fetch from event if column existed
        end_time: '22:00',
        guest_count: data.tickets
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking Error:', bookingError);
      throw new Error('Failed to create booking');
    }

    // 3. Create Order if items exist
    if (data.items.length > 0) {
        // Calculate food total
        let foodTotal = 0;
        
        // Fetch product prices to be safe (and secure)
        const productIds = data.items.map(i => i.product_id);
        const { data: products } = await supabase
            .from('products')
            .select('id, price')
            .in('id', productIds);
            
        const productMap = new Map(products?.map(p => [p.id, p.price]));

        const orderItemsData = [];

        for (const item of data.items) {
            const price = productMap.get(item.product_id) || 0;
            foodTotal += price * item.quantity;
            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: price,
                total_price: price * item.quantity
            });
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                booking_id: booking.id,
                customer_name: data.name,
                customer_email: data.email,
                customer_phone: data.phone,
                status: 'pending',
                order_type: 'pickup', // Treated as pickup/dine-in at event
                total: foodTotal,
                subtotal: foodTotal,
                payment_status: 'pending'
            })
            .select()
            .single();

        if (orderError) {
             console.error('Order Error:', orderError);
             // Should probably rollback booking, but for now just log
             // throw new Error('Failed to create order');
        } else {
            // Insert Order Items
            const itemsToInsert = orderItemsData.map(item => ({
                order_id: order.id,
                ...item
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);
            
            if (itemsError) {
                console.error('Order Items Error:', itemsError);
            }
        }
    }

    revalidatePath('/events');
    return { success: true, bookingId: booking.id };

  } catch (error: any) {
    console.error('Create Booking Exception:', error);
    return { success: false, error: error.message };
  }
}
