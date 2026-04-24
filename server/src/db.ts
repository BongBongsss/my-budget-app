import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
