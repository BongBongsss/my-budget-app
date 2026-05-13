const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDeleted() {
  // backup_v3.sql은 원본 데이터 (920건)
  // 현재 DB의 Transaction 테이블 상태와 비교하여 사라진 1건을 찾습니다.
  
  const currentTransactions = await prisma.transaction.findMany({
    select: { date: true, time: true, amount: true, vendor: true }
  });

  console.log(`Current DB Count: ${currentTransactions.length}`);
  console.log('--- Checking for the single deleted record ---');
  // 이 스크립트보다는 직접 cleanup.ts의 로직을 통해 무엇이 삭제되었는지 추론하는 것이 정확합니다.
  // cleanup.ts는 같은 baseKey 내에서 hash 충돌이 날 때 삭제합니다.
  
  await prisma.$disconnect();
}
// 실제로는 cleanup 과정에서 hash 중복으로 삭제된 것이므로, 
// '내용, 시간, 금액, 순번'까지 완전히 똑같은 행이 2개 있었다는 뜻입니다.
