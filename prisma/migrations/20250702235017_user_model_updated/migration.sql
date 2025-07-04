-- DropForeignKey
ALTER TABLE "VideoData" DROP CONSTRAINT "VideoData_clerkId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "VideoData" ADD CONSTRAINT "VideoData_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
