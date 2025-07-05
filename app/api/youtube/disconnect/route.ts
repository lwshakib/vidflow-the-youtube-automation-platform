import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Remove YouTube refresh token from database
    await prisma.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        youtubeRefreshToken: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "YouTube account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting YouTube account:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
