-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_userId_fkey";

-- DropIndex
DROP INDEX "Entity_userId_idx";

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
