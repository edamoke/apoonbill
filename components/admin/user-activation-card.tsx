"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { activateUser } from "@/app/actions/activate-user"

interface UserActivationCardProps {
  userId: string
  email: string
  fullName: string
  emailConfirmed: boolean
}

export function UserActivationCard({ userId, email, fullName, emailConfirmed }: UserActivationCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmAndActivateUser = async () => {
    setLoading(true)
    setError(null)

    const result = await activateUser(userId)

    if (!result.success) {
      setError(result.error || "Failed to activate user")
      setLoading(false)
      return
    }

    setShowConfirmDialog(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {emailConfirmed ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-500/10 text-green-600 border-green-200">Confirmed</Badge>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Circle className="h-5 w-5 text-amber-600" />
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                  Pending
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirmDialog(true)}
                disabled={loading}
                className="ml-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Confirm & Activate"
                )}
              </Button>
            </>
          )}
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm & Activate User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate {fullName} ({email}) without requiring email verification. They can now use all
              features immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmAndActivateUser} className="bg-green-600 hover:bg-green-700">
            Activate User
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
