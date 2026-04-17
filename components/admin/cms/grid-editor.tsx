"use client"

import { useState } from "react"
import { updateSiteSetting } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GridSplitEditor({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateSiteSetting("grid_split", content)
      if (result.success) {
        toast.success("Grid sections updated")
      } else {
        toast.error("Failed to update grid sections")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gift Card Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Tag (e.g. BRAND NEW)</Label>
            <Input 
              value={content.giftCard.tag} 
              onChange={(e) => setContent({...content, giftCard: {...content.giftCard, tag: e.target.value}})}
            />
          </div>
          <div className="grid gap-2">
            <Label>Intro text</Label>
            <Input 
              value={content.giftCard.intro} 
              onChange={(e) => setContent({...content, giftCard: {...content.giftCard, intro: e.target.value}})}
            />
          </div>
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input 
              value={content.giftCard.title} 
              onChange={(e) => setContent({...content, giftCard: {...content.giftCard, title: e.target.value}})}
            />
          </div>
          <div className="grid gap-2">
            <Label>Card Text</Label>
            <Input 
              value={content.giftCard.cardText} 
              onChange={(e) => setContent({...content, giftCard: {...content.giftCard, cardText: e.target.value}})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seafood Card Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input 
              value={content.seafoodCard.title} 
              onChange={(e) => setContent({...content, seafoodCard: {...content.seafoodCard, title: e.target.value}})}
            />
          </div>
          <div className="grid gap-2">
            <Label>Image URL</Label>
            <Input 
              value={content.seafoodCard.image} 
              onChange={(e) => setContent({...content, seafoodCard: {...content.seafoodCard, image: e.target.value}})}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save All Grid Changes"}
      </Button>
    </div>
  )
}
