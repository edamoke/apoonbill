"use client"

import { createClient } from "@/lib/supabase/client"

export type BusinessLead = {
  id: string
  created_at: string
  updated_at: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  event_date: string | null
  event_location: string | null
  lead_status: string
  is_linked_to_system: boolean
  link_order_id: string | null
  total_amount: number
  notes: string | null
  document_number: string
}

export type BusinessLeadItem = {
  id: string
  lead_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  product_id: string | null
}

export async function getBusinessLeads() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("business_leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as BusinessLead[]
}

export async function getBusinessLead(id: string) {
  const supabase = createClient()
  const { data: lead, error: leadError } = await supabase
    .from("business_leads")
    .select("*")
    .eq("id", id)
    .single()

  if (leadError) throw leadError

  const { data: items, error: itemsError } = await supabase
    .from("business_lead_items")
    .select("*")
    .eq("lead_id", id)

  if (itemsError) throw itemsError

  return { ...lead, items } as BusinessLead & { items: BusinessLeadItem[] }
}

export async function createBusinessLead(lead: Partial<BusinessLead>, items: Partial<BusinessLeadItem>[]) {
  const supabase = createClient()
  
  const { data: newLead, error: leadError } = await supabase
    .from("business_leads")
    .insert([lead])
    .select()
    .single()

  if (leadError) throw leadError

  const itemsToInsert = items.map(item => ({
    ...item,
    lead_id: newLead.id
  }))

  const { error: itemsError } = await supabase
    .from("business_lead_items")
    .insert(itemsToInsert)

  if (itemsError) throw itemsError

  return newLead
}

export async function updateBusinessLead(id: string, lead: Partial<BusinessLead>, items: Partial<BusinessLeadItem>[]) {
  const supabase = createClient()

  const { error: leadError } = await supabase
    .from("business_leads")
    .update(lead)
    .eq("id", id)

  if (leadError) throw leadError

  // For simplicity, delete and recreate items
  await supabase.from("business_lead_items").delete().eq("lead_id", id)

  const itemsToInsert = items.map(item => ({
    ...item,
    lead_id: id
  }))

  const { error: itemsError } = await supabase
    .from("business_lead_items")
    .insert(itemsToInsert)

  if (itemsError) throw itemsError

  return { success: true }
}

export async function deleteBusinessLead(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("business_leads").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function toggleSystemLink(id: string, isLinked: boolean) {
  const supabase = createClient()
  
  if (isLinked) {
    // Logic to create a system order if linking
    const { data: lead, error: leadError } = await supabase
      .from("business_leads")
      .select("*, items:business_lead_items(*)")
      .eq("id", id)
      .single()

    if (leadError) throw leadError

    // Create a system order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        client_name: lead.client_name,
        total_amount: lead.total_amount,
        status: 'pending',
        order_type: 'catering',
        payment_method: 'pay_later',
        source: 'admin'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Link lead to order
    const { error: updateError } = await supabase
      .from("business_leads")
      .update({ 
        is_linked_to_system: true,
        link_order_id: order.id
      })
      .eq("id", id)

    if (updateError) throw updateError
  } else {
    // Unlink
    const { error } = await supabase
      .from("business_leads")
      .update({ 
        is_linked_to_system: false,
        link_order_id: null
      })
      .eq("id", id)

    if (error) throw error
  }
  
  return { success: true }
}
