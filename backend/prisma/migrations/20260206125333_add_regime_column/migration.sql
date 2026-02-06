-- AlterTable
ALTER TABLE "evidence" ADD COLUMN     "control_id" TEXT,
ADD COLUMN     "metadata" JSONB,
ALTER COLUMN "check_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "obligations" ADD COLUMN     "article_id" TEXT;

-- CreateTable
CREATE TABLE "jort_entries" (
    "id" TEXT NOT NULL,
    "title_fr" TEXT NOT NULL,
    "title_ar" TEXT,
    "ministry" TEXT,
    "type" TEXT,
    "jort_number" TEXT,
    "date" TIMESTAMP(3),
    "pdf_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jort_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "regulation_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "content_fr" TEXT,
    "content_ar" TEXT,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "regulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
