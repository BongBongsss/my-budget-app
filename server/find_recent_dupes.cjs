const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findDupes() {
  const unverified = await prisma.transaction.findMany({
    where: { isVerified: false },
    orderBy: { date: 'asc' }
  });

  const counts = {};
  const dupes = [];

  for (const tx of unverified) {
    const key = `${tx.date}-${tx.vendor}-${tx.amount}`;
    if (!counts[key]) {
      counts[key] = [];
    }
    counts[key].push(tx);
  }

  console.log('--- Duplicate Groups found in Unverified (457) ---');
  let dupeCount = 0;
  for (const key in counts) {
    if (counts[key].length > 1) {
      console.log(`Duplicate found: ${key} (${counts[key].length} entries)`);
      dupeCount += (counts[key].length - 1);
    }
  }
  
  console.log(`\nTotal extra entries due to duplication: ${dupeCount}`);
  await prisma.$disconnect();
}

findDupes();
