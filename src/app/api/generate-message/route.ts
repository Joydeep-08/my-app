// app/api/generate-message/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { recipientName, occasion } = await req.json();

    if (!recipientName || !occasion) {
      return NextResponse.json(
        { error: "recipientName and occasion are required" },
        { status: 400 }
      );
    }

    // ✅ dynamic import (prevents build-time execution)
    const { default: Groq } = await import("groq-sdk");

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Write a warm, heartfelt closing message for a digital surprise gift.
The recipient's name is: ${recipientName}
The occasion is: ${occasion}
Requirements:
- 2–3 short paragraphs
- Warm, joyful, personal tone — like it was written by someone who loves them
- Do NOT use generic filler phrases like "may this day bring you joy"
- End with a single celebratory sentence
- Plain text only, no bullet points, no markdown
- Keep it under 750 characters`,
        },
      ],
    });

    const message = response.choices[0]?.message?.content?.trim() ?? "";

    if (!message) {
      return NextResponse.json(
        { error: "No message generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Groq error:", err);
    return NextResponse.json(
      { error: "Failed to generate message" },
      { status: 500 }
    );
  }
}