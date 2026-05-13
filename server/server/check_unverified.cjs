const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const totalUnverified = await prisma.transaction.count({
    where: { isVerified: false }
  });
  console.log(`Total Unverified: ${totalUnverified}`);

  const bySource = await prisma.transaction.groupBy({
    by: ['source'],
    where: { isVerified: false },
    _count: { _all: true }
  });
  console.log('--- Unverified by Source ---');
  console.log(bySource);

  const topVendors = await prisma.transaction.groupBy({
    by: ['vendor'],
    where: { isVerified: false },
    _count: { _all: true },
    orderBy: { _count: { vendor: 'desc' } },
    take: 20
  });
  console.log('--- Top Unverified Vendors ---');
  console.log(topVendors);

  await prisma.$disconnect();
}

check();
