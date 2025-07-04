import { inngest } from "@/lib/inngest/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: "pro" });
  if (!hasPremiumAccess) {
    return NextResponse.json(
      {
        statusCode: 429,
        success: false,
        message: "Take The Premium Access to generate awesome videos",
      },
      { status: 429 }
    );
  }
  const body = await req.json();

  const result = await inngest.send({
    name: "generate-video-data",
    data: {
      ...body,
    },
  });

  return NextResponse.json({
    success: true,
    messages: "Added to queue",
    data: result.ids,
  });
}
