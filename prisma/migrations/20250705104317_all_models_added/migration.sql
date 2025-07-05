-- CreateEnum
CREATE TYPE "VIDEO_PROGRESS" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "THUMBNAIL_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "LOGO_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SCHEDULED_UPLOAD_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "imageUrl" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "youtubeRefreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoData" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "captionStyle" JSONB NOT NULL,
    "videoStyle" TEXT NOT NULL,
    "captions" JSONB,
    "images" TEXT[],
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "videoProgress" "VIDEO_PROGRESS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThumbnailRequest" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "THUMBNAIL_STATUS" NOT NULL DEFAULT 'PENDING',
    "thumbnails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThumbnailRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogoRequest" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "logoName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LOGO_STATUS" NOT NULL DEFAULT 'PENDING',
    "logos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogoRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledUpload" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "description" TEXT,
    "status" "SCHEDULED_UPLOAD_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThumbnailRequest" ADD CONSTRAINT "ThumbnailRequest_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoRequest" ADD CONSTRAINT "LogoRequest_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledUpload" ADD CONSTRAINT "ScheduledUpload_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledUpload" ADD CONSTRAINT "ScheduledUpload_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
