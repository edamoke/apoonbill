"use server"

import { createClient } from "@/lib/supabase/server"

export async function generateCategoryImage(name: string, description: string) {
  const apiKey = process.env.POLLEN_API_KEY
  if (!apiKey) {
    return { success: false, error: "Pollen API key not configured" }
  }

  const prompt = `Professional food photography of ${name}. ${description}. High-end restaurant style, studio lighting, appetizing, 4k.`

  try {
    const response = await fetch("https://api.pollen.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to generate image")
    }

    const data = await response.json()
    const imageUrl = data.data[0].url

    // We return the URL. The client component can then download and upload it to Supabase 
    // or just use it directly. To avoid CORS issues and for persistence, 
    // it's better to upload to our storage.
    
    return { success: true, url: imageUrl }
  } catch (error: any) {
    console.error("AI Generation Error:", error)
    return { success: false, error: error.message }
  }
}
