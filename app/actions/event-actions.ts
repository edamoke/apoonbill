'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const eventDate = formData.get('event_date') as string;
  const location = formData.get('location') as string;
  const type = formData.get('type') as 'event' | 'offer';
  const status = formData.get('status') as 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  const imageFile = formData.get('image') as File;

  let imageUrl = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase.from('events').insert({
    title,
    description,
    event_date: eventDate || null,
    location,
    image_url: imageUrl,
    type,
    status,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/events');
  revalidatePath('/offers-events');
  redirect('/admin/events');
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const eventDate = formData.get('event_date') as string;
  const location = formData.get('location') as string;
  const type = formData.get('type') as 'event' | 'offer';
  const status = formData.get('status') as 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  const imageFile = formData.get('image') as File;

  let imageUrl = formData.get('current_image_url') as string;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase
    .from('events')
    .update({
      title,
      description,
      event_date: eventDate || null,
      location,
      image_url: imageUrl,
      type,
      status,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/events');
  revalidatePath('/offers-events');
  redirect('/admin/events');
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/events');
  revalidatePath('/offers-events');
}

export async function createBooking(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const venueName = formData.get('venue_name') as string;
  const bookingDate = formData.get('booking_date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const guestCount = parseInt(formData.get('guest_count') as string);
  const specialRequests = formData.get('special_requests') as string;

  const { error } = await supabase.from('venue_bookings').insert({
    user_id: user.id,
    venue_name: venueName,
    booking_date: bookingDate,
    start_time: startTime,
    end_time: endTime,
    guest_count: guestCount,
    special_requests: specialRequests,
    status: 'pending',
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('venue_bookings')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/bookings');
}
