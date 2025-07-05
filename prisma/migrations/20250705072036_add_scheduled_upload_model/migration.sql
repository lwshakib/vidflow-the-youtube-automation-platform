-- CreateEnum
CREATE TYPE "SCHEDULED_UPLOAD_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

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

-- AddForeignKey
ALTER TABLE "ScheduledUpload" ADD CONSTRAINT "ScheduledUpload_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledUpload" ADD CONSTRAINT "ScheduledUpload_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
