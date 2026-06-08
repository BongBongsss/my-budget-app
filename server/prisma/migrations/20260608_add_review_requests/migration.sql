-- 확인요청/수정요청을 거래, import 대기행, 자산 등에 연결하기 위한 테이블입니다.
CREATE TABLE IF NOT EXISTS "ReviewRequest" (
  "id" text NOT NULL PRIMARY KEY,
  "targetType" text NOT NULL,
  "targetId" text,
  "type" text NOT NULL DEFAULT 'question',
  "title" text NOT NULL,
  "body" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open',
  "authorRole" text,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ReviewRequest_targetType_targetId_idx" ON "ReviewRequest" ("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "ReviewRequest_status_idx" ON "ReviewRequest" ("status");
CREATE INDEX IF NOT EXISTS "ReviewRequest_createdAt_idx" ON "ReviewRequest" ("createdAt");
