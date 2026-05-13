const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 강제 삭제 시작...');
  // 승인되지 않은 모든 데이터 삭제
  const deleted = await prisma.transaction.deleteMany({
    where: { isVerified: false }
  });
  console.log(`✅ 삭제 완료: ${deleted.count}개`);
  await prisma.$disconnect();
}
clean();
