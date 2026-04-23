import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserRoleManager } from "@/components/admin/user-role-manager"
import { UserActivationCard } from "@/components/admin/user-activation-card"
import { UserDeleteButton } from "@/components/admin/user-delete-button"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAllowed = 
    profile?.is_admin || 
    profile?.role === 'admin' || 
    profile?.is_accountant || 
    profile?.role === 'accountant'

  if (!isAllowed) {
    redirect("/dashboard")
  }

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user roles, permissions, and activation status</p>
        </div>

        <div className="space-y-4">
          {users && users.length > 0 ? (
            users.map((userItem) => (
              <Card key={userItem.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">{userItem.full_name || "Unnamed User"}</p>
                        <Badge variant={userItem.is_admin ? "default" : "outline"} className="capitalize">
                          {userItem.role}
                        </Badge>
                        {userItem.is_admin && (
                          <Badge className="bg-red-500/10 text-red-600 border-red-200">Admin</Badge>
                        )}
                        {userItem.is_chef && (
                          <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Chef</Badge>
                        )}
                        {userItem.is_rider && (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Rider</Badge>
                        )}
                        {userItem.is_accountant && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-200">Accountant</Badge>
                        )}
                        {user.id !== userItem.id && (
                          <UserDeleteButton userId={userItem.id} userName={userItem.full_name || userItem.email || "User"} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{userItem.email}</p>
                      {userItem.phone && <p className="text-sm text-muted-foreground">{userItem.phone}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(userItem.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                      <UserActivationCard
                        userId={userItem.id}
                        email={userItem.email}
                        fullName={userItem.full_name || "User"}
                        emailConfirmed={userItem.email_confirmed || false}
                      />
                      <UserRoleManager
                        userId={userItem.id}
                        currentRole={userItem.role}
                        isAdmin={userItem.is_admin}
                        isChef={userItem.is_chef}
                        isRider={userItem.is_rider}
                        isAccountant={userItem.is_accountant}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border">
              <CardContent className="pt-6 text-center text-muted-foreground">No users found</CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
