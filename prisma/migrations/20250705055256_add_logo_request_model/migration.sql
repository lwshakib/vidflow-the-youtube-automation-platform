-- CreateEnum
CREATE TYPE "LOGO_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

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

-- AddForeignKey
ALTER TABLE "LogoRequest" ADD CONSTRAINT "LogoRequest_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
