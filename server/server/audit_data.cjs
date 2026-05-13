const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  console.log('🧐 Auditing DB for 1,000,000 KRW transactions on 2026-04-21...');
  
  const results = await prisma.transaction.findMany({
    where: {
      date: '2026-04-21',
      amount: { in: [1000000, -1000000] }
    }
  });

  if (results.length === 0) {
    console.log('❌ No such transactions found in DB (neither verified nor unverified).');
  } else {
    console.log(`✅ Found ${results.length} matching transactions in DB:`);
    results.forEach(tx => {
      console.log(`- ID: ${tx.id} | Vendor: ${tx.vendor} | Amount: ${tx.amount} | Verified: ${tx.isVerified} | Source: ${tx.source}`);
    });
  }

  await prisma.$disconnect();
}

audit();
