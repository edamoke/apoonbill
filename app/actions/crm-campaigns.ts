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
      { id: "1", name: "Fry-Day Extravaganza: Loaded Fries 20% Off", channel: "Social", audience: "Fries Lovers", status: "Running", roi: "5.2x", budget: 3000, reach: 8500, description: "Promotion for Masala, Peri Peri, and Garlic Fries." },
      { id: "2", name: "New Menu Launch: Sweet Potato Fries", channel: "Push", audience: "All Members", status: "Completed", roi: "3.2x", budget: 2000, reach: 5000, description: "Introduction of new healthy fries variety." },
      { id: "3", name: "Lapsed Customer Win-back", channel: "Email", audience: "Inactive > 30d", status: "Running", roi: "4.5x", budget: 5000, reach: 1200 },
      { id: "4", name: "Birthday Specials", channel: "Automated", audience: "Birthday Today", status: "Active", roi: "8.1x", budget: 1000, reach: 150 },
    ]
  }
  return data
}
