"use client"

import { Button } from "@/components/ui/button"
import { approveSocialPost } from "@/app/actions/loyalty-actions"
import { useState } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"

export function ApprovePostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    try {
      await approveSocialPost(postId)
      toast.success("Post approved and points awarded")
    } catch (error) {
      toast.error("Failed to approve post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="text-green-600 hover:text-green-700"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? "..." : <Check className="h-4 w-4" />}
    </Button>
  )
}
