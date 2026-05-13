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

async function restore() {
  console.log('🔄 Restoring duplicates from backup as unverified...');
  
  const data = fs.readFileSync('transaction_data_raw.txt', 'utf8');
  const lines = data.split('\n');

  const transactions = [];
  for (const line of lines) {
    if (line.trim() === '\\.' || line.trim() === '') break;
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

  const groups = {};
  const duplicatesToRestore = [];

  for (const tx of transactions) {
    const key = `${tx.date}|${tx.time}|${tx.amount}|${tx.vendor}`;
    if (!groups[key]) {
      groups[key] = 1;
    } else {
      // 중복 발견 (2번째, 3번째...)
      const sequence = groups[key];
      groups[key]++;
      
      duplicatesToRestore.push({
        ...tx,
        sequence
      });
    }
  }

  console.log(`🔎 Found ${duplicatesToRestore.length} duplicates to restore.`);

  let restoredCount = 0;
  for (const tx of duplicatesToRestore) {
    const hash = generateHash(tx.date, tx.amount, tx.vendor, tx.time, tx.sequence);
    
    try {
      await prisma.transaction.upsert({
        where: { hash: hash },
        update: { isVerified: false }, // 이미 있으면 미반영으로 변경
        create: {
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
    } catch (e) {
      console.error(`Failed to restore ${tx.vendor}:`, e.message);
    }
  }

  console.log(`✅ Successfully restored ${restoredCount} transactions as 'Unverified'.`);
  await prisma.$disconnect();
}

restore();
