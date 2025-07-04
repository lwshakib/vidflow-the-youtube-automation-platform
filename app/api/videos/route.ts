import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return null;
  const videos = await prisma.videoData.findMany({
    where: {
      clerkId: user.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Videos fetched Successfully",
    data: videos,
  });
}
