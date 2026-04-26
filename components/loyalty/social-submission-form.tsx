"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Share2, Loader2, CheckCircle2 } from "lucide-react"
import { submitSocialPost } from "@/app/actions/loyalty-actions"
import { toast } from "@/hooks/use-toast"

export function SocialSubmissionForm() {
  const [platform, setPlatform] = useState<string>("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!platform || !url) return

    setLoading(true)
    try {
      await submitSocialPost(platform, url)
      setSubmitted(true)
      toast({
        title: "Post Submitted!",
        description: "An admin will review your post and award your points soon.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit post. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center space-y-2">
          <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
          <h3 className="font-bold text-lg">Thank you for sharing!</h3>
          <p className="text-sm text-muted-foreground">
            We've received your submission. Points will be added to your account after verification.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Submit another post
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share & Earn Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select onValueChange={setPlatform} value={platform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">X (Twitter)</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Post URL</Label>
            <Input 
              placeholder="https://..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Must be a public post featuring The Spoonbill
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !platform || !url}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit for Points
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
