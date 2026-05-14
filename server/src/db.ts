import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const initDb = async () => {
  // 세션 테이블 및 인덱스 확인/생성 (connect-pg-simple 호환용)
  try {
    // 1. 테이블 생성
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
    `);

    // 2. 기본키 제약 조건 추가 (이미 존재할 경우 에러 무시)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
    } catch (e) {
      // 이미 존재함
    }

    // 3. 인덱스 생성
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    console.log("✅ Session table check/creation completed.");
  } catch (err) {
    console.error("❌ Failed to create session table:", err);
  }

  // 초기 비밀번호 시딩 (환경 변수 기반)
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const viewerPassword = process.env.VIEWER_PASSWORD || 'viewer123';

    if (adminPassword) {
      const existingAdmin = await prisma.auth.findUnique({ where: { role: 'admin' } });
      if (!existingAdmin) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await prisma.auth.create({ data: { role: 'admin', passwordHash: hash } });
        console.log("🔑 Initial Admin password seeded to DB.");
      }
    }

    const existingViewer = await prisma.auth.findUnique({ where: { role: 'viewer' } });
    if (!existingViewer) {
      const hash = await bcrypt.hash(viewerPassword, 10);
      await prisma.auth.create({ data: { role: 'viewer', passwordHash: hash } });
      console.log("🔑 Initial Viewer password seeded to DB.");
    }
  } catch (err) {
    console.error("❌ Auth seeding failed:", err);
  }

  // 기본 카테고리 시딩
  const categories = ['생활비', '자기계발', '문화/여가', '건강/의료', '교통/통신', '기타'];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { id: Date.now().toString() + name, name },
    });
  }
};

export default prisma;
