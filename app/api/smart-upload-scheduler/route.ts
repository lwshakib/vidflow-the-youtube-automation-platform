import { inngest } from "@/lib/inngest/client";
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
    const { videoId, scheduledDate, scheduledTime, timezone, description } =
      body;

    if (!videoId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Video ID, scheduled date, and time are required",
        },
        { status: 400 }
      );
    }

    // Verify the video belongs to the user
    const video = await prisma.videoData.findFirst({
      where: {
        id: videoId,
        clerkId: user.id,
      },
    });

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          message: "Video not found or access denied",
        },
        { status: 404 }
      );
    }

    // Create scheduled upload record
    const scheduledUpload = await prisma.scheduledUpload.create({
      data: {
        videoId,
        clerkId: user.id,
        scheduledDate: new Date(`${scheduledDate}T${scheduledTime}`),
        timezone,
        description: description || "",
        status: "PENDING",
      },
    });

    // Schedule the task with Inngest
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

    await inngest.send({
      name: "upload/scheduled",
      data: {
        scheduledUploadId: scheduledUpload.id,
        videoId: scheduledUpload.videoId,
        scheduledDate: scheduledDateTime.toISOString(),
        timezone: scheduledUpload.timezone,
        description: scheduledUpload.description,
        userId: scheduledUpload.clerkId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Upload scheduled successfully",
      data: scheduledUpload,
    });
  } catch (error) {
    console.error("Error scheduling upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

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

    const scheduledUploads = await prisma.scheduledUpload.findMany({
      where: {
        clerkId: user.id,
      },
      include: {
        video: true,
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled uploads fetched successfully",
      data: scheduledUploads,
    });
  } catch (error) {
    console.error("Error fetching scheduled uploads:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const scheduledId = searchParams.get("id");

    if (!scheduledId) {
      return NextResponse.json(
        {
          success: false,
          message: "Scheduled upload ID is required",
        },
        { status: 400 }
      );
    }

    // Verify the scheduled upload belongs to the user
    const scheduledUpload = await prisma.scheduledUpload.findFirst({
      where: {
        id: scheduledId,
        clerkId: user.id,
      },
    });

    if (!scheduledUpload) {
      return NextResponse.json(
        {
          success: false,
          message: "Scheduled upload not found or access denied",
        },
        { status: 404 }
      );
    }

    // Only allow cancellation of PENDING uploads
    if (scheduledUpload.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Only pending uploads can be cancelled",
        },
        { status: 400 }
      );
    }

    // Send cancellation event to Inngest
    await inngest.send({
      name: "upload/cancelled",
      data: {
        scheduledUploadId: scheduledId,
      },
    });

    // Update the status to CANCELLED
    const updatedUpload = await prisma.scheduledUpload.update({
      where: {
        id: scheduledId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Upload cancelled successfully",
      data: updatedUpload,
    });
  } catch (error) {
    console.error("Error cancelling upload:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
