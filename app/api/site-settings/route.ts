import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  const supabase = await createClient()

  let query = supabase.from("site_settings").select("*")

  if (id) {
    query = query.eq("id", id)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { id, content } = await request.json()

  const { error } = await supabase.from("site_settings").upsert({ id, content })

  if (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Site settings updated successfully" })
}
