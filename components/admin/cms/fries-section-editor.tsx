"use client"

import { useState } from "react"
import { updateSiteSetting } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Upload, MoveUp, MoveDown, Loader2, Utensils } from "lucide-react"

export function FriesSectionEditor({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState({
    title: initialContent?.title || "Our Signature Fries",
    items: initialContent?.items || [
      { title: "Masala Fries", img: "/placeholder.jpg" },
      { title: "Plain Fries", img: "/placeholder.jpg" }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateSiteSetting("fries_section", content)
      if (result.success) {
        toast.success("Fries Section updated")
      } else {
        toast.error("Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setContent({
      ...content,
      items: [
        ...content.items,
        { title: "New Fries Item", img: "/placeholder.jpg" }
      ]
    })
  }

  const removeItem = (index: number) => {
    const newItems = content.items.filter((_: any, i: number) => i !== index)
    setContent({ ...content, items: newItems })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...content.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setContent({ ...content, items: newItems })
  }

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(index)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `site-assets/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      updateItem(index, 'img', publicUrl)
      toast.success("Image uploaded successfully")
    } catch (error: any) {
      toast.error("Upload failed: " + error.message)
    } finally {
      setUploading(null)
    }
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...content.items]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newItems.length) return
    
    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp
    setContent({ ...content, items: newItems })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary flex items-center gap-2">
            <Utensils className="h-5 w-5 fill-primary" />
            Fries Section
          </CardTitle>
          <CardDescription>Manage the scrolling fries items just after the hero section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-2">
            <Label className="font-bold">Section Heading</Label>
            <Input 
              value={content.title} 
              onChange={(e) => setContent({...content, title: e.target.value})}
              placeholder="e.g. Our Signature Fries"
              className="bg-muted/30"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Fries Items</h4>
              <Button onClick={addItem} size="sm" variant="outline" className="h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="grid gap-4">
              {content.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-4 border rounded-2xl bg-card shadow-sm group relative">
                  <div className="w-32 h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative border shadow-inner">
                    {item.img ? (
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <input
                        type="file"
                        id={`fries-img-${index}`}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                      />
                      <Button 
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        onClick={() => document.getElementById(`fries-img-${index}`)?.click()}
                        disabled={uploading === index}
                      >
                        {uploading === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Item Name</Label>
                      <Input 
                        value={item.title} 
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        placeholder="Item Title"
                        className="font-serif italic"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Image URL</Label>
                      <Input 
                        value={item.img} 
                        onChange={(e) => updateItem(index, 'img', e.target.value)}
                        placeholder="Manual URL or Upload"
                        className="text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      disabled={index === 0} 
                      onClick={() => moveItem(index, 'up')}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      disabled={index === content.items.length - 1} 
                      onClick={() => moveItem(index, 'down')}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <div className="mt-auto">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-6 flex justify-center pt-4 pb-10">
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          size="lg"
          className="w-full max-w-md bg-primary text-white shadow-xl hover:scale-105 transition-transform font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : "Save Fries Section"}
        </Button>
      </div>
    </div>
  )
}
