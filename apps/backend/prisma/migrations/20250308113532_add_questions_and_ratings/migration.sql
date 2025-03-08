/*
  Warnings:

  - The values [ONE,TWO,THREE,FOUR,FIVE] on the enum `rating_enum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `theme` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "rating_enum_new" AS ENUM ('1', '2', '3', '4', '5');
ALTER TABLE "Review" ALTER COLUMN "rating" TYPE "rating_enum_new" USING ("rating"::text::"rating_enum_new");
ALTER TABLE "QuestionRating" ALTER COLUMN "rating" TYPE "rating_enum_new" USING ("rating"::text::"rating_enum_new");
ALTER TYPE "rating_enum" RENAME TO "rating_enum_old";
ALTER TYPE "rating_enum_new" RENAME TO "rating_enum";
DROP TYPE "rating_enum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "analytics_reports" DROP CONSTRAINT "analytics_reports_theme_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_theme_id_fkey";

-- DropForeignKey
ALTER TABLE "ideas" DROP CONSTRAINT "ideas_theme_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_group_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_reviewee_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "theme" DROP CONSTRAINT "theme_created_by_fkey";

-- DropTable
DROP TABLE "review";

-- DropTable
DROP TABLE "theme";

-- CreateTable
CREATE TABLE "Theme" (
    "theme_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "submission_deadline" TIMESTAMP(3) NOT NULL,
    "voting_deadline" TIMESTAMP(3) NOT NULL,
    "review_deadline" JSONB NOT NULL,
    "auto_assign_group" BOOLEAN NOT NULL,
    "team_lead_acceptance" BOOLEAN,
    "number_of_groups" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("theme_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "reviewee_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "rating" "rating_enum" NOT NULL,
    "feedback" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "Question" (
    "question_id" SERIAL NOT NULL,
    "theme_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "QuestionRating" (
    "rating_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "rating" "rating_enum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionRating_pkey" PRIMARY KEY ("rating_id")
);

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme"("theme_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme"("theme_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_reports" ADD CONSTRAINT "analytics_reports_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme"("theme_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "Theme"("theme_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRating" ADD CONSTRAINT "QuestionRating_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRating" ADD CONSTRAINT "QuestionRating_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("review_id") ON DELETE RESTRICT ON UPDATE CASCADE;
