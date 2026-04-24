import db from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID } from 'crypto';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  vendor: string;
  category: string;
  type: 'income' | 'expense';
  source?: string;
  is_recurring: number;
  raw_data?: string;
}

export const getAllTransactions = () => {
  return db.prepare('SELECT * FROM transactions ORDER BY date DESC').all() as Transaction[];
};

export const bulkAddTransactions = (transactions: Partial<Transaction>[]) => {
  const insert = db.prepare(`
    INSERT INTO transactions (id, date, amount, vendor, category, type, source, is_recurring, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((transactions: Partial<Transaction>[]) => {
    return transactions.map(transaction => {
      const id = randomUUID();
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = transaction.amount || 0;
      const vendor = transaction.vendor || 'Unknown';
      const type = transaction.type || 'expense';
      const category = transaction.category || autoCategorize(vendor);
      const source = transaction.source || 'manual';
      const is_recurring = transaction.is_recurring || 0;
      const raw_data = transaction.raw_data || null;

      insert.run(id, date, amount, vendor, category, type, source, is_recurring, raw_data);
      return { id, date, amount, vendor, category, type, source, is_recurring, raw_data };
    });
  });

  return insertMany(transactions);
};

export const addTransaction = (transaction: Partial<Transaction>) => {
  const id = randomUUID();
  const date = transaction.date || new Date().toISOString().split('T')[0];
  const amount = transaction.amount || 0;
  const vendor = transaction.vendor || 'Unknown';
  const type = transaction.type || 'expense';
  const category = transaction.category || autoCategorize(vendor);
  const source = transaction.source || 'manual';
  const is_recurring = transaction.is_recurring || 0;
  const raw_data = transaction.raw_data || null;

  const stmt = db.prepare(`
    INSERT INTO transactions (id, date, amount, vendor, category, type, source, is_recurring, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, date, amount, vendor, category, type, source, is_recurring, raw_data);
  return { id, date, amount, vendor, category, type, source, is_recurring, raw_data };
};

export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => (updates as any)[field]);

  const stmt = db.prepare(`UPDATE transactions SET ${setClause} WHERE id = ?`);
  return stmt.run(...values, id);
};

export const deleteTransaction = (id: string) => {
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  return stmt.run(id);
};
