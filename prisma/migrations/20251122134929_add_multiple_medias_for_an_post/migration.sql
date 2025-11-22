-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT NOT NULL,
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "tags" JSONB,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Media" (
  "id",
  "order",
  "imageUrl",
  "isVideo",
  "createdAt",
  "updatedAt",
  "postId",
  "tags"
)
SELECT
  gen_random_uuid(),
  1,
  "imageUrl",
  "isVideo",
  "createdAt",
  "updatedAt",
  "id" AS "postId",
  "tags"
FROM "Post";
