const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTheOne() {
  console.log('🔄 Searching for the last missing transaction...');

  // 1. 엑셀 파일 읽기
  const workbook = XLSX.readFile('current_import.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const fileRows = XLSX.utils.sheet_to_json(sheet);
  console.log(`Excel Rows: ${fileRows.length}`);

  // 2. DB '신규' 데이터 가져오기
  const unverified = await prisma.transaction.findMany({
    where: { isVerified: false },
    select: { date: true, time: true, amount: true, vendor: true }
  });
  console.log(`Unverified in DB: ${unverified.length}`);

  const dbCounts = {};
  unverified.forEach(tx => {
    const key = `${tx.date}-${(tx.time || '').trim()}-${Math.abs(tx.amount)}-${(tx.vendor || '').trim()}`;
    dbCounts[key] = (dbCounts[key] || 0) + 1;
  });

  // 3. 대조하여 누락된 1개 찾기
  const missing = [];
  const fileOccurrence = {};

  fileRows.forEach((row, i) => {
    let dateRaw = row['날짜'] || row['일자'];
    let dateStr = "";
    if (dateRaw && !isNaN(Number(dateRaw)) && typeof dateRaw !== 'object') {
       const date = new Date((Number(dateRaw) - 25569) * 86400 * 1000);
       dateStr = date.toISOString().split('T')[0];
    } else {
       dateStr = String(dateRaw || '').split(' ')[0].replace(/\./g, '-');
    }
    const amount = Math.abs(parseFloat(String(row['금액'] || '0').replace(/,/g, '').replace(/[^\d.-]/g, '')));
    const vendor = String(row['내용'] || row['가맹점명'] || '').trim();
    const time = String(row['시간'] || '').trim();
    
    const key = `${dateStr}-${time}-${amount}-${vendor}`;
    fileOccurrence[key] = (fileOccurrence[key] || 0) + 1;

    if (fileOccurrence[key] > (dbCounts[key] || 0)) {
      missing.push({ line: i + 2, date: dateStr, time, vendor, amount });
    }
  });

  console.log('\n--- THE MISSING TRANSACTION ---');
  if (missing.length === 0) {
    console.log('No missing transactions found! (Wait, then what is 427?)');
  } else {
    missing.forEach(m => {
      console.log(`[Line ${m.line}] ${m.date} ${m.time} | ${m.vendor} | ${m.amount}원`);
    });
  }

  await prisma.$disconnect();
}

findTheOne();
