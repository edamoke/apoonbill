import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"

export default async function CategoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile?.is_admin && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!category) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryForm category={category} />
    </div>
  )
}
