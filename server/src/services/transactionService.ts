import prisma from '../db';
import { autoCategorize } from './categoryService';
import { randomUUID } from 'crypto';
import { Transaction } from '@prisma/client';

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  const data = await Promise.all(transactions.map(async (transaction) => {
    return {
      id: randomUUID(),
      date: transaction.date || new Date().toISOString().split('T')[0],
      amount: transaction.amount || 0,
      vendor: transaction.vendor || 'Unknown',
      type: transaction.type || 'expense',
      category: transaction.category || (await autoCategorize(transaction.vendor || 'Unknown')),
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data: transaction.raw_data || null,
    };
  }));

  return await prisma.transaction.createMany({
    data,
  });
};

export const addTransaction = async (transaction: Partial<Transaction>) => {
  const category = transaction.category || await autoCategorize(transaction.vendor || 'Unknown');
  
  return await prisma.transaction.create({
    data: {
      id: randomUUID(),
      date: transaction.date || new Date().toISOString().split('T')[0],
      amount: transaction.amount || 0,
      vendor: transaction.vendor || 'Unknown',
      type: transaction.type || 'expense',
      category: category,
      source: transaction.source || 'manual',
      is_recurring: transaction.is_recurring || 0,
      raw_data: transaction.raw_data || null,
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
