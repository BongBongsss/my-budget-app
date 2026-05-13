const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const prisma = new PrismaClient();

const generateHash = (date, amount, vendor, time = '', sequence = 0) => {
  const normalizedVendor = (vendor || 'Unknown').trim();
  const normalizedAmount = Math.abs(amount);
  const normalizedTime = time || '';
  
  return crypto.createHash('sha256')
    .update(`${date}-${normalizedTime}-${normalizedAmount}-${normalizedVendor}-${sequence}`)
    .digest('hex');
};

async function finalRestore() {
  console.log('🔄 Final attempt to restore missing duplicates...');

  const content = fs.readFileSync('backup_fixed.sql', 'utf8');
  const lines = content.split('\n');

  let inTransactionData = false;
  const transactions = [];

  for (const line of lines) {
    if (line.startsWith('COPY public."Transaction"')) {
      inTransactionData = true;
      continue;
    }
    if (inTransactionData) {
      if (line.startsWith('\\.')) {
        inTransactionData = false;
        break;
      }
      const parts = line.split('\t');
      if (parts.length >= 12) {
        transactions.push({
          date: parts[1],
          amount: parseFloat(parts[2]),
          vendor: parts[3],
          category: parts[4],
          type: parts[5],
          source: parts[6],
          memo: parts[8],
          currency: parts[9],
          subcategory: parts[10],
          time: parts[11]
        });
      }
    }
  }

  const groups = {};
  const duplicatesToRestore = [];

  for (const tx of transactions) {
    const key = `${tx.date}|${tx.time}|${tx.amount}|${tx.vendor}`;
    if (!groups[key]) {
      groups[key] = 1;
    } else {
      const sequence = groups[key];
      groups[key]++;
      duplicatesToRestore.push({ ...tx, sequence });
    }
  }

  let restoredCount = 0;
  for (const tx of duplicatesToRestore) {
    const hash = generateHash(tx.date, tx.amount, tx.vendor, tx.time, tx.sequence);
    
    try {
      // 이미 있는지 먼저 확인
      const existing = await prisma.transaction.findUnique({ where: { hash } });
      if (!existing) {
        await prisma.transaction.create({
          data: {
            id: uuidv4(),
            date: tx.date,
            amount: tx.amount,
            vendor: tx.vendor,
            category: tx.category,
            type: tx.type,
            source: tx.source,
            memo: tx.memo,
            currency: tx.currency,
            subcategory: tx.subcategory,
            time: tx.time,
            hash: hash,
            isVerified: false
          }
        });
        restoredCount++;
      }
    } catch (e) {
      // 에러 나면 그냥 다음으로
    }
  }

  console.log(`✅ Successfully restored ${restoredCount} unique missing duplicates.`);
  await prisma.$disconnect();
}

finalRestore();
