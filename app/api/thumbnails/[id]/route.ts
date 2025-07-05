import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const thumbnailRequest = await prisma.thumbnailRequest.findFirst({
      where: {
        id: params.id,
        clerkId: userId,
      },
    });

    if (!thumbnailRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Thumbnail request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: thumbnailRequest.id,
        title: thumbnailRequest.title,
        description: thumbnailRequest.description,
        status: thumbnailRequest.status,
        thumbnails: thumbnailRequest.thumbnails,
        createdAt: thumbnailRequest.createdAt,
        updatedAt: thumbnailRequest.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching thumbnail request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
