"use client"

import { useState } from "react"
import { updateSiteSetting } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FooterEditor({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateSiteSetting("footer", content)
      if (result.success) {
        toast.success("Footer updated")
      } else {
        toast.error("Failed to update footer")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateLocationLine = (index: number, value: string) => {
    const newLines = [...content.location.lines]
    newLines[index] = value
    setContent({...content, location: {...content.location, lines: newLines}})
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Location Title</Label>
          <Input 
            value={content.location.title} 
            onChange={(e) => setContent({...content, location: {...content.location, title: e.target.value}})}
          />
        </div>
        <div className="grid gap-2">
          <Label>Address Lines</Label>
          {content.location.lines.map((line: string, i: number) => (
            <Input 
              key={i}
              value={line} 
              onChange={(e) => updateLocationLine(i, e.target.value)}
            />
          ))}
        </div>
        <div className="grid gap-2">
          <Label>Contact Phone</Label>
          <Input 
            value={content.contact.phone} 
            onChange={(e) => setContent({...content, contact: {...content.contact, phone: e.target.value}})}
          />
        </div>
        <div className="grid gap-2">
          <Label>Copyright Text</Label>
          <Input 
            value={content.copyright} 
            onChange={(e) => setContent({...content, copyright: e.target.value})}
          />
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Footer Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}
