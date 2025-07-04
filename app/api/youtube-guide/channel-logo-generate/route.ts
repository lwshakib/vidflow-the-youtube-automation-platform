import { YOUTUBE_CHANNEL_LOGO } from "@/constants/prompt";
import { openAIClient } from "@/lib/openai/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { channelName, channelDescription } = await req.json();

  const prompt = YOUTUBE_CHANNEL_LOGO
    .replace("{{N}}", channelName)
    .replace("{{D}}", channelDescription);

  const response = await openAIClient.images.generate({
    model: "black-forest-labs/flux-schnell",
    response_format: "url",
    // @ts-expect-error
    response_extension: "png",
    width: 1024, // Square dimensions
    height: 1024,
    num_inference_steps: 4,
    negative_prompt: "",
    seed: -1,
    prompt: prompt,
  });

  if (!response?.data?.[0]?.url) {
    return NextResponse.json({
      success: false,
      message: "Logo failed to generate",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Logo generated successfully",
    data: response.data[0].url,
  });
}
