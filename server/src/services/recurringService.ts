import db from '../db';
import { randomUUID } from 'crypto';

interface RecurringTransaction {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  day_of_month: number;
}

export const processRecurringTransactions = () => {
  const recurring = db.prepare('SELECT * FROM recurring_transactions').all() as RecurringTransaction[];
  const today = new Date();
  const day = today.getDate();
  const dateStr = today.toISOString().split('T')[0];

  for (const item of recurring) {
    if (item.day_of_month === day) {
      // 오늘 날짜에 이미 해당 고정 지출이 등록되었는지 확인
      const existing = db.prepare('SELECT * FROM transactions WHERE date = ? AND vendor = ? AND source = ?')
        .get(dateStr, item.vendor, 'recurring');
      
      if (!existing) {
        db.prepare('INSERT INTO transactions (id, date, amount, vendor, category, type, source) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(randomUUID(), dateStr, item.amount, item.vendor, item.category, item.type, 'recurring');
      }
    }
  }
};
