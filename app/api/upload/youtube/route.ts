import { inngest } from "@/lib/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await inngest.send({
      name: "upload-video-on-youtube",
      data: {
        ...body,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Video Uploading. We will notify you using email when it is uploaded",
        data: result,
      },
      { status: 202 }
    );
  } catch (error: any) {
    // Optionally log the error here
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initiate YouTube upload.",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
