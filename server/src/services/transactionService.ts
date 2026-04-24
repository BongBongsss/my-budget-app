import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수
const generateHash = (date: string, amount: number, vendor: string, raw_data?: string | null) => {
  return createHash('sha256')
    .update(`${date}-${amount}-${vendor}-${raw_data || ''}`)
    .digest('hex');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  const data = await Promise.all(transactions.map(async (transaction) => {
    const date = transaction.date || new Date().toISOString().split('T')[0];
    const amount = transaction.amount || 0;
    const vendor = transaction.vendor || 'Unknown';
    const raw_data = transaction.raw_data || null;
    
    return {
      id: randomUUID(),
      date,
      amount,
      vendor,
      type: transaction.type || 'expense',
      category: transaction.category || (await autoCategorize(vendor)),
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data,
      hash: generateHash(date, amount, vendor, raw_data),
      memo: transaction.memo || null,
    };
  }));

  // skipDuplicates를 사용하여 이미 존재하는 hash는 무시하고 새 것만 저장
  return await prisma.transaction.createMany({
    data,
    skipDuplicates: true,
  });
};

export const addTransaction = async (transaction: Partial<Transaction>) => {
  const date = transaction.date || new Date().toISOString().split('T')[0];
  const amount = transaction.amount || 0;
  const vendor = transaction.vendor || 'Unknown';
  const category = transaction.category || await autoCategorize(vendor);
  const raw_data = transaction.raw_data || null;
  const hash = generateHash(date, amount, vendor, raw_data);

  return await prisma.transaction.upsert({
    where: { hash: hash },
    update: {}, // 이미 있으면 업데이트 안 함
    create: {
      id: randomUUID(),
      date,
      amount,
      vendor,
      type: transaction.type || 'expense',
      category: category,
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data,
      hash,
      memo: transaction.memo || null,
    },
  });
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  return await prisma.transaction.update({
    where: { id },
    data: updates,
  });
};

export const deleteTransaction = async (id: string) => {
  return await prisma.transaction.delete({
    where: { id },
  });
};
