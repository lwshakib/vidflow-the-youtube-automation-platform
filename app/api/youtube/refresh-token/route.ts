import { googleClientId, googleClientSecret } from "@/lib/env/config";
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

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser?.youtubeRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No YouTube refresh token found. Please reconnect your account.",
        },
        { status: 404 }
      );
    }

    // Exchange refresh token for new access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: googleClientId || "",
        client_secret: googleClientSecret || "",
        refresh_token: dbUser.youtubeRefreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Token refresh failed:", data);
      
      // If refresh token is invalid, remove it from database
      if (response.status === 400 || response.status === 401) {
        await prisma.user.update({
          where: {
            clerkId: user.id,
          },
          data: {
            youtubeRefreshToken: null,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to refresh token. Please reconnect your YouTube account.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
