import { analyzeFood } from "@/lib/openrouter"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { base64Image } = await request.json()

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const analysis = await analyzeFood(base64Image)
    return NextResponse.json(analysis)
    
  } catch (error) {
    console.error("Error in analyze endpoint:", error)
    return NextResponse.json(
      { error: "Failed to analyze food image" },
      { status: 500 }
    )
  }
}
