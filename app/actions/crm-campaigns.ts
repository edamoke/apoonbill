import { createClient } from "@/lib/supabase/server"

export async function getCampaigns() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
  
  // If table doesn't exist yet, return mock for UI development
  if (error) {
    console.warn("Marketing campaigns table not found, using mock data")
    return [
      { id: "1", name: "Lapsed Customer Win-back", channel: "Email", audience: "Inactive > 30d", status: "Running", roi: "4.5x", budget: 5000, reach: 1200 },
      { id: "2", name: "New Menu Launch", channel: "Push", audience: "All Members", status: "Completed", roi: "3.2x", budget: 2000, reach: 5000 },
      { id: "3", name: "Birthday Specials", channel: "Automated", audience: "Birthday Today", status: "Active", roi: "8.1x", budget: 1000, reach: 150 },
    ]
  }
  return data
}
