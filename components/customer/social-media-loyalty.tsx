"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Upload, 
  Instagram, 
  Facebook, 
  Twitter, 
  Send, 
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function SocialMediaLoyalty({ user }: { user: any }) {
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("none")
  const [postData, setPostData] = useState({
    platform: 'instagram',
    caption: '',
    image_url: ''
  })

  const filters = [
    { name: "none", label: "Natural", class: "" },
    { name: "sepia", label: "Vintage", class: "sepia" },
    { name: "grayscale", label: "Classic", class: "grayscale" },
    { name: "brightness", label: "Glow", class: "brightness-125" },
  ]

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/social-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('user_content')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user_content')
        .getPublicUrl(filePath)

      setPostData({ ...postData, image_url: publicUrl })
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  async function submitPost() {
    if (!postData.image_url) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          platform: postData.platform,
          caption: postData.caption,
          image_url: postData.image_url,
          status: 'pending'
        })

      if (error) throw error
      toast({ 
        title: "Post Submitted!", 
        description: "An admin will verify your post and award 50 loyalty points shortly." 
      })
      setPostData({ platform: 'instagram', caption: '', image_url: '' })
    } catch (error: any) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <Instagram className="h-6 w-6 text-primary" />
          Earn Loyalty Points via Social Media
        </CardTitle>
        <p className="text-sm text-muted-foreground">Share your dining experience and get 50 points per approved post!</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload & Editor */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {['instagram', 'facebook', 'twitter', 'tiktok'].map(p => (
                <Button 
                  key={p} 
                  variant={postData.platform === p ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                  onClick={() => setPostData({...postData, platform: p})}
                >
                  {p}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Share your thoughts...</Label>
              <Textarea 
                placeholder="Delicious meal at The Spoonbill! #thespoonbill" 
                value={postData.caption}
                onChange={(e) => setPostData({...postData, caption: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <Label>Photography Filters</Label>
              <div className="grid grid-cols-4 gap-2">
                {filters.map(f => (
                  <Button 
                    key={f.name}
                    variant={selectedFilter === f.name ? 'default' : 'outline'}
                    size="sm"
                    className="text-[10px] uppercase font-bold"
                    onClick={() => setSelectedFilter(f.name)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
               <Label
                htmlFor="social-upload"
                className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                <span className="text-sm font-bold uppercase">Upload Photo</span>
                <Input id="social-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </Label>
              <Button 
                className="h-12 px-8 rounded-xl font-black uppercase" 
                disabled={!postData.image_url || loading}
                onClick={submitPost}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Post & Earn
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center bg-background/50 rounded-2xl p-4 border border-primary/10">
             {postData.image_url ? (
               <div className="space-y-4 w-full max-w-[300px]">
                  <div className={`aspect-square rounded-lg overflow-hidden shadow-2xl transition-all duration-500 ${filters.find(f => f.name === selectedFilter)?.class}`}>
                    <img src={postData.image_url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-primary flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Preview on {postData.platform}
                    </p>
                    <p className="text-xs italic text-muted-foreground line-clamp-2">{postData.caption || "Your caption here..."}</p>
                  </div>
               </div>
             ) : (
               <div className="text-center space-y-2 opacity-30">
                  <ImageIcon className="h-16 w-16 mx-auto" />
                  <p className="text-xs font-black uppercase">No image uploaded</p>
               </div>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
