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

async function fixAndRestore() {
  console.log('🧹 Cleaning up corrupted data and restoring from fixed backup...');

  // 1. 모든 미승인(isVerified=false) 내역 삭제
  await prisma.transaction.deleteMany({
    where: { isVerified: false }
  });

  // 2. backup_fixed.sql 파일 읽기
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

  // 3. 중복 내역만 골라내기
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

  console.log(`🔎 Found ${duplicatesToRestore.length} healthy duplicates to restore.`);

  for (const tx of duplicatesToRestore) {
    const hash = generateHash(tx.date, tx.amount, tx.vendor, tx.time, tx.sequence);
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
  }

  console.log(`✅ Restoration complete! Check your 'New' tab now.`);
  await prisma.$disconnect();
}

fixAndRestore();
