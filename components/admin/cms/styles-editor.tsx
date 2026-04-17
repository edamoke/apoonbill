"use client"

import { useState } from "react"
import { updateSiteSetting } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FONT_COMBINATIONS } from "@/lib/fonts"

export function StylesEditor({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateSiteSetting("styles", content)
      if (result.success) {
        toast.success("Styles updated")
      } else {
        toast.error("Failed to update styles")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Styles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Font Combination</Label>
          <Select 
            value={content.fontComboId || "classic-elegant"} 
            onValueChange={(value) => setContent({...content, fontComboId: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font combination" />
            </SelectTrigger>
            <SelectContent>
              {FONT_COMBINATIONS.map((combo) => (
                <SelectItem key={combo.id} value={combo.id}>
                  {combo.name} ({combo.heading} / {combo.body})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Base Font Size</Label>
          <Select 
            value={content.fontSize} 
            onValueChange={(value) => setContent({...content, fontSize: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Background Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              className="w-12 p-1"
              value={content.backgroundColor} 
              onChange={(e) => setContent({...content, backgroundColor: e.target.value})}
            />
            <Input 
              value={content.backgroundColor} 
              onChange={(e) => setContent({...content, backgroundColor: e.target.value})}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Primary Brand Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              className="w-12 p-1"
              value={content.primaryColor} 
              onChange={(e) => setContent({...content, primaryColor: e.target.value})}
            />
            <Input 
              value={content.primaryColor} 
              onChange={(e) => setContent({...content, primaryColor: e.target.value})}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Secondary Brand Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              className="w-12 p-1"
              value={content.secondaryColor} 
              onChange={(e) => setContent({...content, secondaryColor: e.target.value})}
            />
            <Input 
              value={content.secondaryColor} 
              onChange={(e) => setContent({...content, secondaryColor: e.target.value})}
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Styles"}
        </Button>
      </CardContent>
    </Card>
  )
}
