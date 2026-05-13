const fs = require('fs');

const data = fs.readFileSync('transaction_data_raw.txt', 'utf8');
const lines = data.split('\n');

const transactions = [];
for (const line of lines) {
  if (line.trim() === '\\.' || line.trim() === '') break;
  const parts = line.split('\t');
  if (parts.length >= 12) {
    transactions.push({
      date: parts[1],
      amount: parts[2],
      vendor: parts[3],
      category: parts[4],
      type: parts[5],
      source: parts[6],
      hash: parts[7],
      memo: parts[8],
      currency: parts[9],
      subcategory: parts[10],
      time: parts[11],
      isVerified: parts[12]?.trim()
    });
  }
}

const groups = {};
transactions.forEach(tx => {
  const key = `${tx.date}|${tx.time}|${tx.amount}|${tx.vendor}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(tx);
});

console.log('--- Duplicate Transactions found in Backup ---');
let foundCount = 0;
for (const key in groups) {
  if (groups[key].length > 1) {
    const [date, time, amount, vendor] = key.split('|');
    console.log(`[${date} ${time}] ${vendor}: ${amount}원 (${groups[key].length}건 중복)`);
    foundCount++;
  }
}

if (foundCount === 0) {
  console.log('No exact duplicates found by content grouping.');
}
