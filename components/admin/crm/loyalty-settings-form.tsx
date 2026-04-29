"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateLoyaltyConfig } from "@/app/actions/loyalty-actions"
import { useState } from "react"
import { toast } from "sonner"

export function LoyaltySettingsForm({ config }: { config: any }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const newConfig = {
      points_per_100_kes: Number(formData.get("points_per_100")),
      min_spend_for_points: Number(formData.get("min_spend")),
      social_bonus_points: Number(formData.get("social_bonus")),
    }
    
    try {
      await updateLoyaltyConfig(newConfig)
      toast.success("Loyalty configuration updated")
    } catch (error) {
      toast.error("Failed to update loyalty configuration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Points per KSh 100 spent</Label>
        <Input name="points_per_100" type="number" defaultValue={config.points_per_100_kes} required />
      </div>
      <div className="space-y-2">
        <Label>Minimum spend to earn (KSh)</Label>
        <Input name="min_spend" type="number" defaultValue={config.min_spend_for_points} required />
      </div>
      <div className="space-y-2">
        <Label>Social Media Bonus Points</Label>
        <Input name="social_bonus" type="number" defaultValue={config.social_bonus_points} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
