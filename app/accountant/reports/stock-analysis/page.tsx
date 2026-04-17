"use client"

import { ReportView } from "@/components/admin/reports/report-view"
import { useEffect, useState } from "react"
import { getStockStatus, ReportFilters } from "@/app/actions/report-actions"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountantStockAnalysisPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({})
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/sign-in");
        return;
      }
      setUser(user);
      
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profile);

      const isAccountant = profile?.is_accountant || profile?.role === "accountant" || !!profile?.custom_role_id;
      const isAdmin = profile?.is_admin || profile?.role === "admin";

      if (!isAccountant && !isAdmin) {
        router.push("/dashboard");
        return;
      }
    }
    checkAccess();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const result = await getStockStatus()
        // Transform stock status into an analysis format if needed
        setData(result || [])
      } catch (error) {
        console.error("Failed to load stock analysis", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters])

  const columns = [
    { key: "name", label: "Product Name" },
    { key: "current_stock", label: "Current Stock" },
    { key: "reorder_level", label: "Reorder Level" },
    { key: "unit", label: "Unit" },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      {/* Stable Accountant Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <LayoutDashboard className="h-5 w-5 text-primary" />
           <span className="font-bold">Accountant - Inventory Analysis</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-muted-foreground">{profile?.full_name || user?.email}</span>
           <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Exit to Site</Link>
           </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Stock Variance Analysis</h2>
        </div>

        <ReportView 
          title="Inventory Audit" 
          data={data} 
          columns={columns}
          isLoading={loading}
          onFiltersChange={setFilters}
        />
      </main>
    </div>
  )
}
