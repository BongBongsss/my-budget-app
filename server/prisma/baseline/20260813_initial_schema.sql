-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT,
    "hash" TEXT,
    "memo" TEXT,
    "currency" TEXT,
    "subcategory" TEXT,
    "time" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "member" TEXT NOT NULL DEFAULT '효',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isManualCategory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "filename" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "rowNumber" INTEGER,
    "status" TEXT NOT NULL,
    "invalidReason" TEXT,
    "sourceTransactionId" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "vendor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT,
    "source" TEXT,
    "memo" TEXT,
    "member" TEXT NOT NULL DEFAULT '미지정',
    "rawData" JSONB,
    "committedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isManualCategory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryRule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "assigned_category" TEXT NOT NULL,

    CONSTRAINT "CategoryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupName" TEXT NOT NULL DEFAULT '기타',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryGroupRule" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "assignedGroup" TEXT NOT NULL,

    CONSTRAINT "CategoryGroupRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRule" (
    "id" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "PaymentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense',
    "day_of_month" INTEGER NOT NULL,
    "member" TEXT NOT NULL DEFAULT 'shared',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVariable" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "member" TEXT NOT NULL DEFAULT '공동',

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isLiability" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHistory" (
    "id" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "totalAssets" DOUBLE PRECISION NOT NULL,
    "totalLiabilities" DOUBLE PRECISION NOT NULL,
    "netAssets" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgnoredRule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "IgnoredRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeferredRuleSuggestion" (
    "id" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "deferredUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeferredRuleSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgnoredRecurringSuggestion" (
    "id" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgnoredRecurringSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeferredRecurringSuggestion" (
    "id" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "deferredUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeferredRecurringSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExclusionRule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "ExclusionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedHash" (
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedHash_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Auth" (
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("role")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchId" TEXT,
    "restoredAt" TIMESTAMP(3),

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'question',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "authorRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "readByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "readByViewer" BOOLEAN NOT NULL DEFAULT false,
    "authorRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartStatisticsSettings" (
    "id" TEXT NOT NULL,
    "excludedGroups" JSONB NOT NULL DEFAULT '{"income": [], "expense": []}',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartStatisticsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringAlias" (
    "id" TEXT NOT NULL,
    "recurringId" TEXT NOT NULL,
    "vendorKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringMatchConfirmation" (
    "id" TEXT NOT NULL,
    "recurringId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringMatchConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "ImportRow_sourceTransactionId_key" ON "ImportRow"("sourceTransactionId");

-- CreateIndex
CREATE INDEX "ImportRow_status_idx" ON "ImportRow"("status");

-- CreateIndex
CREATE INDEX "ImportRow_batchId_idx" ON "ImportRow"("batchId");

-- CreateIndex
CREATE INDEX "ImportRow_createdAt_idx" ON "ImportRow"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryRule_keyword_key" ON "CategoryRule"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryGroupRule_categoryName_key" ON "CategoryGroupRule"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRule_keyword_key" ON "PaymentRule"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "session_sid_key" ON "session"("sid");

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session"("expire");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_key" ON "Asset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetType_name_key" ON "AssetType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetHistory_yearMonth_key" ON "AssetHistory"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "IgnoredRule_keyword_key" ON "IgnoredRule"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "DeferredRuleSuggestion_vendorKey_key" ON "DeferredRuleSuggestion"("vendorKey");

-- CreateIndex
CREATE INDEX "DeferredRuleSuggestion_deferredUntil_idx" ON "DeferredRuleSuggestion"("deferredUntil");

-- CreateIndex
CREATE UNIQUE INDEX "IgnoredRecurringSuggestion_vendorKey_key" ON "IgnoredRecurringSuggestion"("vendorKey");

-- CreateIndex
CREATE UNIQUE INDEX "DeferredRecurringSuggestion_vendorKey_key" ON "DeferredRecurringSuggestion"("vendorKey");

-- CreateIndex
CREATE INDEX "DeferredRecurringSuggestion_deferredUntil_idx" ON "DeferredRecurringSuggestion"("deferredUntil");

-- CreateIndex
CREATE UNIQUE INDEX "ExclusionRule_keyword_key" ON "ExclusionRule"("keyword");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_batchId_idx" ON "AuditLog"("batchId");

-- CreateIndex
CREATE INDEX "AuditLog_restoredAt_idx" ON "AuditLog"("restoredAt");

-- CreateIndex
CREATE INDEX "ReviewRequest_targetType_targetId_idx" ON "ReviewRequest"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ReviewRequest_status_idx" ON "ReviewRequest"("status");

-- CreateIndex
CREATE INDEX "ReviewRequest_createdAt_idx" ON "ReviewRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Notice_isActive_idx" ON "Notice"("isActive");

-- CreateIndex
CREATE INDEX "Notice_createdAt_idx" ON "Notice"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringAlias_vendorKey_key" ON "RecurringAlias"("vendorKey");

-- CreateIndex
CREATE INDEX "RecurringAlias_recurringId_idx" ON "RecurringAlias"("recurringId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringMatchConfirmation_transactionId_key" ON "RecurringMatchConfirmation"("transactionId");

-- CreateIndex
CREATE INDEX "RecurringMatchConfirmation_yearMonth_idx" ON "RecurringMatchConfirmation"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringMatchConfirmation_recurringId_yearMonth_key" ON "RecurringMatchConfirmation"("recurringId", "yearMonth");

-- AddForeignKey
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
