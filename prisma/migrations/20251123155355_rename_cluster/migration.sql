/*
  Warnings:

  - You are about to drop the column `entityClusterId` on the `Entity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Entity" DROP CONSTRAINT "Entity_entityClusterId_fkey";

-- AlterTable
ALTER TABLE "Entity" DROP COLUMN "entityClusterId",
ADD COLUMN     "clusterId" TEXT;

-- AddForeignKey
ALTER TABLE "Entity" ADD CONSTRAINT "Entity_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "EntityCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
