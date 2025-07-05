import { aws_config } from "@/lib/aws/client";
import { inngest } from "@/lib/inngest/client";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client(aws_config as any);
const BUCKET_NAME = "vidflow2025";

// Helper function to upload file to S3 and return URL
async function uploadFileToS3(
  file: File,
  userId: string,
  index: number
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const objectKey = `reference-images/${userId}/${timestamp}-${index}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const putCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(putCommand);

  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
}

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("files") as File[];

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
        },
        { status: 400 }
      );
    }

    // Handle reference images (optional)
    let imageUrls: string[] = [];
    let fileNames: string[] = [];

    if (files && files.length > 0) {
      // Validate file types (images only)
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            {
              success: false,
              message: "Only image files (JPEG, PNG, WebP) are allowed",
            },
            { status: 400 }
          );
        }
      }

      // Upload files to S3 and get URLs
      imageUrls = await Promise.all(
        files.map((file, index) => uploadFileToS3(file, userId, index))
      );
      fileNames = files.map((file) => file.name);
    }

    // Trigger Inngest function for thumbnail generation with URLs
    const eventId = await inngest.send({
      name: "generate-thumbnails",
      data: {
        title,
        description,
        imageUrls,
        userId,
        fileNames,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thumbnail generation started",
      data: {
        eventId,
        status: "PROCESSING",
        message:
          "Your thumbnails are being generated. This may take a few minutes.",
      },
    });
  } catch (error) {
    console.error("Error starting thumbnail generation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
