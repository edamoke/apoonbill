'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateSuggestedEquipment } from '@/lib/catering-utils';

export async function submitCateringRequest(formData: any) {
  const supabase = await createClient();
  
  const {
    customerName,
    customerEmail,
    customerPhone,
    eventDate,
    eventTime,
    location,
    totalPeople,
    mealTypes,
    mealDetails,
    drinkDetails,
  } = formData;

  const { data: { user } } = await supabase.auth.getUser();

  const suggested = calculateSuggestedEquipment(Number(totalPeople));

  // Create catering request
  const { data: request, error: requestError } = await supabase
    .from('catering_requests')
    .insert({
      user_id: user?.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      event_date: eventDate,
      event_time: eventTime,
      location: location,
      total_people: Number(totalPeople),
      meal_types: mealTypes,
      meal_details: mealDetails,
      drink_details: drinkDetails,
      ...suggested,
      status: 'pending',
    })
    .select()
    .single();

  if (requestError) {
    console.error('Error submitting catering request:', requestError);
    return { success: false, error: requestError.message };
  }

  // Also create a business lead
  try {
    await supabase.from('business_leads').insert({
      client_name: customerName,
      client_email: customerEmail,
      client_phone: customerPhone,
      event_date: eventDate,
      event_location: location,
      lead_status: 'new',
      notes: `Catering Request for ${totalPeople} people. Meals: ${mealTypes.join(', ')}. Details: ${mealDetails}`,
      total_amount: 0, // Will be updated during quotation
    });
  } catch (leadError) {
    console.error('Error creating business lead:', leadError);
    // We don't fail the whole request if lead creation fails
  }

  revalidatePath('/admin/catering');
  revalidatePath('/admin/business-leads');
  return { success: true, data: request };
}

export async function updateCateringQuotation(id: string, updateData: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('catering_requests')
    .update({
      ...updateData,
      responded_by: user?.id,
      responded_at: new Date().toISOString(),
      status: 'quoted',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating catering quotation:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/catering');
  revalidatePath(`/admin/catering/${id}`);
  return { success: true, data };
}

export async function getCateringRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catering_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching catering requests:', error);
    return [];
  }
  return data;
}

export async function getCateringRequestById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catering_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching catering request:', error);
    return null;
  }
  return data;
}
