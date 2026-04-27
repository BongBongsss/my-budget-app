import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initDb = async () => {
  // 세션 테이블 수동 생성 (connect-pg-simple 자동 생성 오류 대비)
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
      
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey') THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("✅ Session table check/creation completed.");
  } catch (err) {
    console.error("❌ Failed to create session table:", err);
  }

  // 기본 카테고리 데이터 삽입 (없을 경우)
  const categories = ['식비', '교통', '주거/통신', '의료/건강', '문화/여가', '기타'];
  
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: Date.now().toString() + name, name },
    });
  }
};

export default prisma;
