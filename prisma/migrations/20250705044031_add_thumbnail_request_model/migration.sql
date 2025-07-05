-- CreateEnum
CREATE TYPE "THUMBNAIL_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

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

-- AddForeignKey
ALTER TABLE "ThumbnailRequest" ADD CONSTRAINT "ThumbnailRequest_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
