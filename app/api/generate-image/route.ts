import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, width = 1024, height = 1024, seed = Math.floor(Math.random() * 1000000) } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Pollinations AI image generation URL
    // Format: https://pollinations.ai/p/[prompt]?width=[width]&height=[height]&seed=[seed]
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error in Pollinations AI route:', error);
    return NextResponse.json({ error: 'Failed to generate image URL' }, { status: 500 });
  }
}
