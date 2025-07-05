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

    const body = await req.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token is required",
        },
        { status: 400 }
      );
    }

    // Save refresh token to database
    await prisma.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        youtubeRefreshToken: refresh_token,
      },
    });

    return NextResponse.json({
      success: true,
      message: "YouTube refresh token saved successfully",
    });
  } catch (error) {
    console.error("Error saving YouTube token:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
