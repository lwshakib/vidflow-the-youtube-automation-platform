import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const videoId = (await params).id;

  if (!videoId) {
    return NextResponse.json({
      success: false,
      message: "Video ID not found",
    });
  }
  const videoDetails = await prisma.videoData.findUnique({
    where: {
      id: videoId,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Video Details fetched Successfully",
    data: videoDetails,
  });
}
