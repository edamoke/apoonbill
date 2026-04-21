"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Share2, Image as ImageIcon, Camera } from "lucide-react"

export function FoodGallery({ profile, user }: { profile: any, user: any }) {
  const [images, setImages] = useState<any[]>(profile.food_gallery || [])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/gallery/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user_content')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user_content')
        .getPublicUrl(filePath)

      const newImage = { 
        url: publicUrl, 
        created_at: new Date().toISOString(),
        id: crypto.randomUUID()
      }
      
      const updatedGallery = [newImage, ...images]
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ food_gallery: updatedGallery })
        .eq("id", user.id)

      if (updateError) throw updateError

      setImages(updatedGallery)
      toast({
        title: "Photo added",
        description: "Your food photo has been added to your gallery.",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const shareOnSocial = (imgUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Delicious The Spoonbill!',
        text: 'Check out this meal I had at The Spoonbill!',
        url: imgUrl,
      }).catch(console.error);
    } else {
      // Fallback for desktop or browsers without Web Share API
      const shareUrl = encodeURIComponent(imgUrl)
      const text = encodeURIComponent('Check out this delicious meal I had at The Spoonbill!')
      
      // We can offer a simple choice or just copy to clipboard
      navigator.clipboard.writeText(imgUrl)
      
      toast({
        title: "Share link copied!",
        description: "We've copied the image link to your clipboard. You can now paste it on your favorite social platform.",
      })

      // Optionally open a new window for common platforms
      // window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank')
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="font-serif text-2xl">Food Gallery</CardTitle>
          <CardDescription>Capture and share your dining experiences.</CardDescription>
        </div>
        <div className="flex gap-2">
          {/* Direct Camera Access for Mobile - Primary Action */}
          <div className="relative group/btn">
            <Button variant="default" size="sm" disabled={uploading} className="hidden sm:flex bg-primary hover:bg-primary/90">
              <Camera className="mr-2 h-4 w-4" />
              Take Food Photo
            </Button>
            <Button variant="default" size="icon" disabled={uploading} className="sm:hidden h-10 w-10 rounded-full shadow-lg bg-primary">
              <Camera className="h-5 w-5" />
            </Button>
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={uploading}
              title="Take a photo with your camera"
            />
          </div>
          
          {/* File input for existing photos - Secondary Action */}
          <div className="relative group/btn">
            <Button variant="outline" size="sm" disabled={uploading} className="hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button variant="outline" size="icon" disabled={uploading} className="sm:hidden h-10 w-10 rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              title="Upload from gallery"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.length > 0 ? (
            images.map((img: any) => (
              <div key={img.id || img.url} className="aspect-square rounded-xl overflow-hidden relative group border bg-muted shadow-sm hover:shadow-md transition-all duration-300">
                <img src={img.url} alt="Food" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-10 w-10 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform"
                    onClick={() => shareOnSocial(img.url)}
                    title="Share to social media"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
              <div className="bg-background rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm border group-hover:scale-110 transition-transform">
                <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground italic font-serif text-xl px-4">"A picture is worth a thousand bites."</p>
              <p className="text-sm text-muted-foreground mt-2 px-4">Capture your meal directly with your camera to share with friends!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
