import { createClient } from "@/lib/supabase/server"

export async function getCRMClients() {
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      loyalty_points,
      lifetime_spend,
      total_orders,
      created_at
    `)
    .or("role.eq.user,role.is.null")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching CRM clients:", error)
    return []
  }

  // Get last visit (latest order) for each client
  const clientsWithLastVisit = await Promise.all((clients || []).map(async (client) => {
    const { data: lastOrder } = await supabase
      .from("orders")
      .select("created_at")
      .eq("user_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return {
      ...client,
      last_visit: lastOrder?.created_at || null
    }
  }))

  return clientsWithLastVisit
}
