import { SCRIPT_GENERATE_PROMPT } from "@/constants/prompt";
import { ai } from "@/lib/gemini/client";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  const prompt = SCRIPT_GENERATE_PROMPT.replace("{{TOPIC}}", topic);

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return NextResponse.json({
    success: true,
    message: "Scripts Generated Successfully",
    data: JSON.parse(response.text as string),
  });
}
