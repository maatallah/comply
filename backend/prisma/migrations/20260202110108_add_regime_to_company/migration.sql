-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "tax_id" TEXT NOT NULL,
    "cnss_id" TEXT,
    "activity_sector" TEXT NOT NULL,
    "company_size" TEXT NOT NULL,
    "employee_count" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'TN',
    "regime" TEXT NOT NULL DEFAULT 'ONSHORE',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'fr',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title_fr" TEXT NOT NULL,
    "title_ar" TEXT,
    "authority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description_fr" TEXT,
    "description_ar" TEXT,
    "effective_date" TIMESTAMP(3),
    "source_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "regulation_id" TEXT NOT NULL,
    "title_fr" TEXT NOT NULL,
    "title_ar" TEXT,
    "description_fr" TEXT,
    "description_ar" TEXT,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL,
    "penalty" TEXT,
    "applicable_to" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "document_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controls" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "obligation_id" TEXT NOT NULL,
    "title_fr" TEXT NOT NULL,
    "title_ar" TEXT,
    "description_fr" TEXT,
    "description_ar" TEXT,
    "control_type" TEXT NOT NULL,
    "expected_evidence" TEXT,
    "frequency" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checks" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "control_id" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "check_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "findings" TEXT,
    "corrective_actions" TEXT,
    "next_check_due" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "check_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadlines" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "obligation_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title_fr" TEXT NOT NULL,
    "title_ar" TEXT,
    "message_fr" TEXT NOT NULL,
    "message_ar" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "audit_type" TEXT NOT NULL,
    "auditor" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "score" INTEGER,
    "findings" TEXT,
    "report_url" TEXT,
    "next_audit_due" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_id_key" ON "companies"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "regulations_code_key" ON "regulations"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligations" ADD CONSTRAINT "obligations_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "regulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controls" ADD CONSTRAINT "controls_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "obligations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "controls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checks" ADD CONSTRAINT "checks_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "obligations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
