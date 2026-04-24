import { PrismaClient } from '@prisma/client';

// 환경 변수 확인
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

// 명시적으로 URL 전달
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const initDb = async () => {
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
