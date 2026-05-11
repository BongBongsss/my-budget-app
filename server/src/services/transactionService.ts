import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID } from 'crypto';
import { Transaction } from '@prisma/client';

type DuplicateComparable = Pick<Transaction, 'date' | 'vendor' | 'amount'>;

const normalizeText = (value: string | null | undefined) => {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

const normalizeAmount = (value: number | null | undefined) => {
  return Math.round(Math.abs(Number(value || 0)) * 100);
};

const buildDuplicateKey = (tx: Partial<DuplicateComparable>) => {
  return [
    normalizeText(tx.date),
    normalizeText(tx.vendor),
    normalizeAmount(tx.amount),
  ].join('|');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  try {
    const uniqueVendors = Array.from(new Set(transactions.map(t => t.vendor || 'Unknown')));
    const categoryMap = await bulkAutoCategorize(uniqueVendors);

    const verifiedTransactions = await prisma.transaction.findMany({
      where: { isVerified: true },
      select: {
        date: true,
        vendor: true,
        amount: true,
      },
    });
    const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));

    const dataToInsert = transactions.map((t) => {
      const normalized = {
        date: t.date || new Date().toISOString().split('T')[0],
        time: (t.time || '').trim(),
        type: (t.type || 'expense').trim(),
        category: t.category || categoryMap[t.vendor || 'Unknown'] || '기타',
        subcategory: (t.subcategory || '').trim(),
        vendor: (t.vendor || 'Unknown').trim(),
        amount: Math.abs(t.amount || 0),
        currency: (t.currency || 'KRW').trim(),
        source: (t.source || 'file_import').trim(),
        memo: t.memo || null,
      };

      return {
        id: randomUUID(),
        ...normalized,
        hash: randomUUID(),
        isVerified: false,
        isDuplicate: verifiedKeys.has(buildDuplicateKey(normalized)),
      };
    });

    await prisma.transaction.createMany({
      data: dataToInsert as any,
      skipDuplicates: false,
    });

    return dataToInsert;
  } catch (error) {
    console.error('Import Error:', error);
    throw error;
  }
};

export const verifyTransactions = async (ids: string[]) => {
  return await prisma.transaction.updateMany({
    where: { id: { in: ids } },
    data: { isVerified: true }
  });
};

export const addTransaction = async (transaction: Partial<Transaction>) => {
  const category = transaction.category || await autoCategorize(transaction.vendor || 'Unknown');
  return await prisma.transaction.create({
    data: {
      id: randomUUID(),
      date: transaction.date || new Date().toISOString().split('T')[0],
      time: transaction.time || '',
      type: transaction.type || 'expense',
      category: category,
      subcategory: transaction.subcategory || null,
      vendor: (transaction.vendor || 'Unknown').trim(),
      amount: Math.abs(transaction.amount || 0),
      currency: transaction.currency || 'KRW',
      source: transaction.source || 'manual',
      memo: transaction.memo || null,
      hash: randomUUID(),
      isVerified: true,
      isDuplicate: false
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

export const bulkDeleteTransactions = async (ids: string[]) => {
  return await prisma.transaction.deleteMany({
    where: { id: { in: ids } }
  });
};

export const cleanupTransactions = async () => {
  const [verifiedTransactions, unverifiedTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { isVerified: true },
      select: {
        date: true,
        vendor: true,
        amount: true,
      },
    }),
    prisma.transaction.findMany({
      where: { isVerified: false },
      select: {
        id: true,
        date: true,
        vendor: true,
        amount: true,
        isDuplicate: true,
      },
    }),
  ]);

  const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));
  let updatedCount = 0;

  for (const tx of unverifiedTransactions) {
    const shouldBeDuplicate = verifiedKeys.has(buildDuplicateKey(tx));
    if (tx.isDuplicate !== shouldBeDuplicate) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { isDuplicate: shouldBeDuplicate },
      });
      updatedCount++;
    }
  }

  return {
    updatedCount,
    deletedCount: 0
  };
};

export const applyAutoRulesToExisting = async () => {
  const transactions = await prisma.transaction.findMany({
    where: {
      NOT: [{ category: '기타' }, { category: '' }],
      isVerified: true
    }
  });

  let updatedCount = 0;
  for (const tx of transactions) {
    const newCategory = await autoCategorize(tx.vendor);
    if (newCategory !== '기타' && newCategory !== tx.category) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { category: newCategory }
      });
      updatedCount++;
    }
  }
  return updatedCount;
};
