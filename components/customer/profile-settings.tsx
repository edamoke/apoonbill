"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, Plus, ImageIcon, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FoodGallery } from "./food-gallery"
import { changePassword } from "@/app/actions/auth-actions"

interface ProfileSettingsProps {
  profile: any
  user: any
}

export function ProfileSettings({ profile: initialProfile, user }: ProfileSettingsProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [newMeal, setNewMeal] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  async function updateProfile(updates: any) {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error

      setProfile({ ...profile, ...updates })
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('user_content')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const pollinationsUrl = `https://image.pollinations.ai/prompt/Professional%20food%20photography%20of%20a%20delicious%20meal%20for%20a%20profile%20avatar?width=400&height=400&seed=${Date.now()}`
      await updateProfile({ avatar_url: pollinationsUrl })
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

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    setPassLoading(true)
    try {
      await changePassword(formData)
      toast({
        title: "Password updated",
        description: "Your security credentials have been updated successfully.",
      })
      form.reset()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setPassLoading(false)
    }
  }

  const addFavoriteMeal = () => {
    if (!newMeal.trim()) return
    const updatedMeals = [...(profile.favorite_meals || []), newMeal.trim()]
    updateProfile({ favorite_meals: updatedMeals })
    setNewMeal("")
  }

  const removeFavoriteMeal = (meal: string) => {
    const updatedMeals = profile.favorite_meals.filter((m: string) => m !== meal)
    updateProfile({ favorite_meals: updatedMeals })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header & Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-bold text-foreground">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">Update your personal information and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-primary/10 transition-all duration-300 group-hover:border-primary/30">
              <AvatarImage src={profile.avatar_url} className="object-cover" />
              <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground font-serif">{profile.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-xl hover:bg-primary/90 transition-all duration-300 transform group-hover:scale-110"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <Input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </Label>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="grid gap-2">
              <Label htmlFor="full_name" className="text-sm font-semibold">Full Name</Label>
              <div className="flex gap-2">
                <Input 
                  id="full_name"
                  defaultValue={profile.full_name} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="bg-background border-border"
                />
                <Button 
                  onClick={() => updateProfile({ full_name: profile.full_name })}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-semibold opacity-70">Email Address</Label>
              <Input value={user.email} disabled className="bg-muted text-muted-foreground border-border cursor-not-allowed" />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Security & Authentication
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="At least 6 characters"
                className="bg-background border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="Repeat your new password"
                className="bg-background border-border"
              />
            </div>
            <Button type="submit" disabled={passLoading}>
              {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences & Favorites */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <ImageIcon className="h-5 w-5 text-primary" />
              Favorite Meals
            </CardTitle>
            <CardDescription>Meals you love at The Spoonbill.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {profile.favorite_meals && profile.favorite_meals.length > 0 ? (
                profile.favorite_meals.map((meal: string) => (
                  <Badge key={meal} variant="secondary" className="pl-3 py-1 flex items-center gap-1 group bg-secondary/50 border-primary/5 hover:border-primary/20 transition-all">
                    {meal}
                    <button 
                      onClick={() => removeFavoriteMeal(meal)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      aria-label={`Remove ${meal}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No favorites added yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a favorite meal..." 
                value={newMeal}
                onChange={(e) => setNewMeal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFavoriteMeal()}
                className="bg-background border-border"
              />
              <Button size="icon" onClick={addFavoriteMeal} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Request New Menu Items</CardTitle>
            <CardDescription>Tell us what you'd like to see next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requested Cuisines</Label>
              <Textarea 
                placeholder="e.g. Authentic Thai, Brazilian BBQ..."
                defaultValue={profile.requested_cuisines?.join(', ')}
                onBlur={(e) => updateProfile({ requested_cuisines: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="bg-background border-border min-h-[80px]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specific Meal Requests</Label>
              <Textarea 
                placeholder="Describe specific dishes you'd love to try..."
                defaultValue={profile.requested_meals?.join(', ')}
                onBlur={(e) => updateProfile({ requested_meals: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                className="bg-background border-border min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <FoodGallery profile={profile} user={user} />
    </div>
  )
}
