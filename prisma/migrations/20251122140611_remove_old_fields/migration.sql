/*
  Warnings:

  - You are about to drop the column `tags` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isVideo` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
DROP COLUMN "isVideo",
DROP COLUMN "tags";
