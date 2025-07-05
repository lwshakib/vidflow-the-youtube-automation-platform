import { googleClientId, googleClientSecret } from "@/lib/env/config";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
      return NextResponse.json({
        success: true,
        connected: false,
        message: "No YouTube connection found",
      });
    }

    // Try to get a fresh access token using the refresh token directly
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
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

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      console.error("Token refresh failed:", refreshData);

      // If refresh token is invalid, remove it from database
      if (refreshResponse.status === 400 || refreshResponse.status === 401) {
        await prisma.user.update({
          where: {
            clerkId: user.id,
          },
          data: {
            youtubeRefreshToken: null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        connected: false,
        message: "YouTube connection expired",
      });
    }

    // Get channel details with fresh access token
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${refreshData.access_token}`,
        },
      }
    );

    if (!channelResponse.ok) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "Failed to fetch channel details",
      });
    }

    const channelData = await channelResponse.json();

    if (channelData.items && channelData.items.length > 0) {
      return NextResponse.json({
        success: true,
        connected: true,
        channel: channelData.items[0],
        access_token: refreshData.access_token,
      });
    } else {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "No channel found",
      });
    }
  } catch (error) {
    console.error("Error checking YouTube status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
