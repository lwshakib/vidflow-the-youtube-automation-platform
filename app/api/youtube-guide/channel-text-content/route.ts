import { YOUTUBE_CHANNEL_NAME_DESCRIPTION_SUGGESTION } from "@/constants/prompt";
import { ai } from "@/lib/gemini/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { selected } = await req.json();

  const prompt = YOUTUBE_CHANNEL_NAME_DESCRIPTION_SUGGESTION.replace(
    "{{CATEGORIES}}",
    selected
  );
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  return NextResponse.json({
    success: true,
    message: "Name & Description Found Successfully",
    data: JSON.parse(response.text as string),
  });
}
