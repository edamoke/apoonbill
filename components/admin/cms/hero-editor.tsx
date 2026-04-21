"use client"

import { useState } from "react"
import { updateSiteSetting } from "@/app/actions/cms-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Upload, MoveUp, MoveDown, Loader2 } from "lucide-react"

export function HeroEditor({ initialContent }: { initialContent: any }) {
  const [content, setContent] = useState({
    title: initialContent?.title || "The Spoonbill",
    subtitle: initialContent?.subtitle || "Malindi",
    logoUrl: initialContent?.logoUrl || "/placeholder-logo.svg",
    slides: initialContent?.slides || [
      {
        mainHeading: initialContent?.mainHeading || "The <br />Spoonbill",
        buttonText: initialContent?.buttonText || "START ORDER",
        backgroundImage: initialContent?.backgroundImage || "/images/hero-new.png",
        excellenceText: initialContent?.excellenceText || "Certificate of Excellence",
        choiceText: initialContent?.choiceText || "Travelers' Choice 2024"
      }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<number | 'logo' | null>(null)

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateSiteSetting("hero", content)
      if (result.success) {
        toast.success("Branding and Hero settings updated")
      } else {
        toast.error("Failed to update settings")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addSlide = () => {
    setContent({
      ...content,
      slides: [
        ...content.slides,
        {
          mainHeading: "New Slide",
          buttonText: "START ORDER",
          backgroundImage: "/images/hero-new.png",
          excellenceText: "Certificate of Excellence",
          choiceText: "Travelers' Choice 2024"
        }
      ]
    })
  }

  const removeSlide = (index: number) => {
    if (content.slides.length <= 1) return
    const newSlides = content.slides.filter((_: any, i: number) => i !== index)
    setContent({ ...content, slides: newSlides })
  }

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...content.slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setContent({ ...content, slides: newSlides })
  }

  const handleImageUpload = async (index: number | 'logo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(index)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `site-assets/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('products') // Using existing products bucket for now
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      if (index === 'logo') {
        setContent({ ...content, logoUrl: publicUrl })
      } else {
        updateSlide(index, 'backgroundImage', publicUrl)
      }
      toast.success("Image uploaded successfully")
    } catch (error: any) {
      toast.error("Upload failed: " + error.message)
    } finally {
      setUploading(null)
    }
  }

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...content.slides]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSlides.length) return
    
    const temp = newSlides[index]
    newSlides[index] = newSlides[newIndex]
    newSlides[newIndex] = temp
    setContent({ ...content, slides: newSlides })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary">Header Branding & Identity</CardTitle>
          <CardDescription>Update the site header logo, name and location subtitle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
             <div className="grid gap-2">
              <Label className="font-bold">Header Title (Logo Text)</Label>
              <Input 
                value={content.title} 
                onChange={(e) => setContent({...content, title: e.target.value})}
                placeholder="e.g. The Spoonbill"
                className="bg-muted/30"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Header Subtitle (Location)</Label>
              <Input 
                value={content.subtitle} 
                onChange={(e) => setContent({...content, subtitle: e.target.value})}
                placeholder="e.g. Malindi"
                className="bg-muted/30"
              />
            </div>
          </div>

          <div className="grid gap-4 p-4 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5">
            <Label className="font-bold text-center">Site Header Logo</Label>
            <div className="flex flex-col items-center gap-4">
               {content.logoUrl && (
                <div className="h-32 w-32 flex items-center justify-center rounded-2xl bg-white shadow-md p-4 group relative">
                  <img src={content.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              
              <div className="flex w-full max-w-md gap-2">
                <Input 
                  value={content.logoUrl} 
                  onChange={(e) => setContent({...content, logoUrl: e.target.value})}
                  placeholder="URL for your logo"
                  className="bg-white"
                />
                <div className="relative">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
                  />
                  <Button 
                    variant="secondary"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploading === 'logo'}
                    className="whitespace-nowrap"
                  >
                    <Upload className="h-4 w-4 mr-2" /> 
                    {uploading === 'logo' ? "..." : "Upload New"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-2xl font-serif font-bold">Hero Slides</h3>
            <p className="text-sm text-muted-foreground">Customize the main attraction slides on your home page</p>
          </div>
          <Button onClick={addSlide} size="lg" className="bg-primary text-white shadow-md">
            <Plus className="h-5 w-5 mr-2" /> Add Slide
          </Button>
        </div>

        {content.slides.map((slide: any, index: number) => (
          <Card key={index} className="border-l-4 border-l-primary/40 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between py-3 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Slide {index + 1}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8"
                  disabled={index === 0} 
                  onClick={() => moveSlide(index, 'up')}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8"
                  disabled={index === content.slides.length - 1} 
                  onClick={() => moveSlide(index, 'down')}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                  onClick={() => removeSlide(index)}
                  disabled={content.slides.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="font-bold">Main Heading</Label>
                  <Input 
                    value={slide.mainHeading} 
                    onChange={(e) => updateSlide(index, 'mainHeading', e.target.value)}
                    placeholder="Supports <br /> for line breaks"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">Button Text</Label>
                  <Input 
                    value={slide.buttonText} 
                    onChange={(e) => updateSlide(index, 'buttonText', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label className="font-bold">Excellence Badge</Label>
                  <Input 
                    value={slide.excellenceText} 
                    onChange={(e) => updateSlide(index, 'excellenceText', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">Travelers' Choice</Label>
                  <Input 
                    value={slide.choiceText} 
                    onChange={(e) => updateSlide(index, 'choiceText', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2 p-4 border rounded-xl bg-muted/10">
                <Label className="font-bold">Background Image</Label>
                <div className="flex gap-2">
                  <Input 
                    value={slide.backgroundImage} 
                    onChange={(e) => updateSlide(index, 'backgroundImage', e.target.value)}
                    className="bg-white"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id={`hero-img-${index}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById(`hero-img-${index}`)?.click()}
                      disabled={uploading === index}
                    >
                      <Upload className="h-4 w-4 mr-2" /> 
                      {uploading === index ? "..." : "Upload"}
                    </Button>
                  </div>
                </div>
                {slide.backgroundImage && (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border shadow-inner mt-2">
                    <img src={slide.backgroundImage} alt={`Slide ${index + 1} Preview`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-6 flex justify-center pt-8 pb-12">
        <Button 
          onClick={handleSave} 
          disabled={loading} 
          size="lg"
          className="w-full max-w-md bg-primary text-white shadow-xl hover:scale-105 transition-transform font-bold text-lg h-14"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : "Save All Branding & Hero Settings"}
        </Button>
      </div>
    </div>
  )
}
