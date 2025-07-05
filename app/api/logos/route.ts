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

    const logoRequests = await prisma.logoRequest.findMany({
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
        requests: logoRequests.map((request) => ({
          id: request.id,
          logoName: request.logoName,
          description: request.description,
          status: request.status,
          logos: request.logos,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching logo requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
