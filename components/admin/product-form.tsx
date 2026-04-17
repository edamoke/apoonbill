"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2, Upload, X, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface ProductFormProps {
  categories: any[]
  product?: any
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || "",
    category_id: product?.category_id || "",
    image_url: product?.image_url || "",
    is_active: product?.is_active ?? true,
    spice_level: product?.spice_level || "0",
    preparation_time: product?.preparation_time || "",
    calories: product?.calories || "",
    is_vegetarian: product?.is_vegetarian || false,
    is_vegan: product?.is_vegan || false,
    allergens: product?.allergens?.join(", ") || "",
    ingredients: product?.ingredients?.join(", ") || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      category_id: formData.category_id || null,
      image_url: formData.image_url,
      is_active: formData.is_active,
      spice_level: Number.parseInt(formData.spice_level),
      preparation_time: formData.preparation_time ? Number.parseInt(formData.preparation_time) : null,
      calories: formData.calories ? Number.parseInt(formData.calories) : null,
      is_vegetarian: formData.is_vegetarian,
      is_vegan: formData.is_vegan,
      allergens: formData.allergens ? formData.allergens.split(",").map((a: string) => a.trim()) : [],
      ingredients: formData.ingredients ? formData.ingredients.split(",").map((i: string) => i.trim()) : [],
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
    }

    let error
    if (product) {
      const result = await supabase.from("products").update(productData).eq("id", product.id)
      error = result.error
    } else {
      const result = await supabase.from("products").insert([productData])
      error = result.error
    }

    if (!error) {
      router.push("/admin/products")
      router.refresh()
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!product || !confirm("Are you sure you want to delete this product?")) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("products").delete().eq("id", product.id)

    if (!error) {
      router.push("/admin/products")
      router.refresh()
    }

    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Error uploading image: " + (error.message || "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateAIImage = async () => {
    if (!formData.name) {
      toast({
        title: "Name Required",
        description: "Please enter a product name first to generate an image.",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const prompt = `Professional food photography of ${formData.name}, high resolution, cinematic lighting, 4k, gourmet presentation`
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width: 800, height: 600 }),
      })

      const data = await response.json()
      if (data.imageUrl) {
        setFormData({ ...formData, image_url: data.imageUrl })
        toast({
          title: "AI Image Generated",
          description: "Click 'Save Product' to keep this image.",
        })
      } else {
        throw new Error("Failed to get image URL")
      }
    } catch (error: any) {
      console.error("AI Generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate AI image.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
            <div className="flex gap-2">
              {product && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image_url">Product Image</Label>
                <div className="mt-2 space-y-4">
                  {formData.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={formData.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Paste image URL or upload..."
                      className="flex-1"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-[42px]"
                        disabled={uploading || generating}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        disabled={uploading || generating}
                      >
                        <Upload className={`h-4 w-4 ${uploading ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10"
                      onClick={handleGenerateAIImage}
                      disabled={uploading || generating}
                      title="Generate AI Image"
                    >
                      {generating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a high-quality image or provide a URL.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preparation_time">Prep Time (mins)</Label>
                  <Input
                    id="preparation_time"
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="spice_level">Spice Level (0-5)</Label>
                <Input
                  id="spice_level"
                  type="number"
                  min="0"
                  max="5"
                  value={formData.spice_level}
                  onChange={(e) => setFormData({ ...formData, spice_level: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="tomato, cheese, basil"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="allergens">Allergens (comma separated)</Label>
                <Input
                  id="allergens"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  placeholder="dairy, gluten"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_vegetarian">Vegetarian</Label>
                  <Switch
                    id="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_vegan">Vegan</Label>
                  <Switch
                    id="is_vegan"
                    checked={formData.is_vegan}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
