import { inngest } from "@/lib/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await inngest.send({
    name: "generate-video-data",
    data: {
      ...body,
    },
  });

  return NextResponse.json({
    result,
  });
}
