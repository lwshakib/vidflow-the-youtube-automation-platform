import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const thumbnailRequests = await prisma.thumbnailRequest.findMany({
      where: {
        clerkId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        requests: thumbnailRequests.map((request) => ({
          id: request.id,
          title: request.title,
          description: request.description,
          status: request.status,
          thumbnails: request.thumbnails,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching thumbnail requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
