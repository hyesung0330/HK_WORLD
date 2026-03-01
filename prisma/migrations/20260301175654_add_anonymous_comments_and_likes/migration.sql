/*
  Warnings:

  - The primary key for the `likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,post_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[anonymous_id,post_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nickname" TEXT,
ALTER COLUMN "author_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "likes" DROP CONSTRAINT "likes_pkey",
ADD COLUMN     "anonymous_id" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_post_id_key" ON "likes"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_anonymous_id_post_id_key" ON "likes"("anonymous_id", "post_id");
