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

    const logoRequest = await prisma.logoRequest.findFirst({
      where: {
        id: params.id,
        clerkId: userId,
      },
    });

    if (!logoRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Logo request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: logoRequest.id,
        logoName: logoRequest.logoName,
        description: logoRequest.description,
        status: logoRequest.status,
        logos: logoRequest.logos,
        createdAt: logoRequest.createdAt,
        updatedAt: logoRequest.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching logo request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
