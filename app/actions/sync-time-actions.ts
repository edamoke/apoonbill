"use server"

import { createClient } from "@/lib/supabase/server"

export async function getServerTime() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_server_time')
  
  if (error) {
    console.error('Error fetching server time:', error)
    return new Date().toISOString()
  }
  
  return data
}
