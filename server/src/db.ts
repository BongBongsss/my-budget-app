import { PrismaClient } from '@prisma/client';

// 환경 변수 설정 확인
if (!process.env.DATABASE_URL) {
  throw new Error("FATAL ERROR: DATABASE_URL is not defined.");
}

// 명시적 옵션 없이 초기화 (Prisma는 자동으로 process.env.DATABASE_URL을 찾습니다)
const prisma = new PrismaClient();

export const initDb = async () => {
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
