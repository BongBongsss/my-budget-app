const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const counts = await prisma.transaction.groupBy({
    by: ['source'],
    where: { isVerified: false },
    _count: { _all: true }
  });
  console.log('--- Unverified Transactions by Source ---');
  console.log(JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}

check();
