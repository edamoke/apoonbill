"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ChevronDown, Check } from "lucide-react"

interface UserRoleManagerProps {
  userId: string
  currentRole: string
  isAdmin: boolean
  isChef?: boolean
  isRider?: boolean
  isAccountant?: boolean
}

export function UserRoleManager({ userId, currentRole, isAdmin, isChef, isRider, isAccountant }: UserRoleManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateRole = async (
    role: string,
    roleFlags: { isAdmin?: boolean; isChef?: boolean; isRider?: boolean; isAccountant?: boolean },
  ) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        role: role,
        is_admin: roleFlags.isAdmin || false,
        is_chef: roleFlags.isChef || false,
        is_rider: roleFlags.isRider || false,
        is_accountant: roleFlags.isAccountant || false,
      })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("Role update error:", updateError)
      setError(updateError.message || "Failed to update role")
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      setError("User not found or update failed")
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? "Updating..." : "Assign Role"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => updateRole("user", {})}
            disabled={currentRole === "user" && !isAdmin && !isChef && !isRider && !isAccountant}
          >
            {currentRole === "user" && !isAdmin && !isChef && !isRider && !isAccountant && (
              <Check className="mr-2 h-4 w-4" />
            )}
            Customer
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("chef", { isChef: true })}
            disabled={isChef && currentRole === "chef"}
          >
            {isChef && <Check className="mr-2 h-4 w-4" />}
            Chef
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("rider", { isRider: true })}
            disabled={isRider && currentRole === "rider"}
          >
            {isRider && <Check className="mr-2 h-4 w-4" />}
            Delivery Rider
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("accountant", { isAccountant: true })}
            disabled={isAccountant && currentRole === "accountant"}
          >
            {isAccountant && <Check className="mr-2 h-4 w-4" />}
            Accountant
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateRole("admin", { isAdmin: true })} disabled={isAdmin}>
            {isAdmin && <Check className="mr-2 h-4 w-4" />}
            Administrator
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("cashier", {})}
            disabled={currentRole === "cashier"}
          >
            {currentRole === "cashier" && <Check className="mr-2 h-4 w-4" />}
            Cashier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("waiter", {})}
            disabled={currentRole === "waiter"}
          >
            {currentRole === "waiter" && <Check className="mr-2 h-4 w-4" />}
            Waiter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => updateRole("bartender", {})}
            disabled={currentRole === "bartender"}
          >
            {currentRole === "bartender" && <Check className="mr-2 h-4 w-4" />}
            Bartender
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  )
}
