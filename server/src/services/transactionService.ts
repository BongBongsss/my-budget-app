import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID } from 'crypto';
import { Transaction } from '@prisma/client';

type DuplicateComparable = Pick<Transaction, 'date' | 'time' | 'vendor' | 'amount' | 'source'>;

const normalizeText = (value: string | null | undefined) => {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

const normalizeAmount = (value: number | null | undefined) => {
  return Math.round(Math.abs(Number(value || 0)) * 100);
};

// Import duplicate matching intentionally ignores fields users commonly edit
// after verification: type, category, subcategory, and memo.
// Source is kept because the same amount/vendor/time can move through different accounts.
const buildDuplicateKey = (tx: Partial<DuplicateComparable>) => {
  return [
    normalizeText(tx.date),
    normalizeText(tx.time),
    normalizeText(tx.vendor),
    normalizeAmount(tx.amount),
    normalizeText(tx.source),
  ].join('|');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    where: { isDeleted: false },
    orderBy: { date: 'desc' },
  });
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  try {
    const uniqueVendors = Array.from(new Set(transactions.map(t => t.vendor || 'Unknown')));
    const categoryMap = await bulkAutoCategorize(uniqueVendors);

    const verifiedTransactions = await prisma.transaction.findMany({
      where: { isVerified: true, isDeleted: false },
      select: {
        date: true,
        time: true,
        vendor: true,
        amount: true,
        source: true,
      },
    });
    const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));
    const batchKeys = new Set<string>();

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
        member: t.member || '효',
      };
      const duplicateKey = buildDuplicateKey(normalized);
      const isDuplicate = verifiedKeys.has(duplicateKey) || batchKeys.has(duplicateKey);
      batchKeys.add(duplicateKey);

      return {
        id: randomUUID(),
        ...normalized,
        // This hash is only a row-level unique value for the existing schema.
        // Duplicate detection uses buildDuplicateKey above.
        hash: randomUUID(),
        isVerified: t.isVerified ?? false,
        isDuplicate: t.isDuplicate ?? isDuplicate,
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
      member: transaction.member || '효',
      // This hash is not used for duplicate detection.
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
  return await prisma.transaction.update({
    where: { id },
    data: { isDeleted: true }
  });
};

export const bulkDeleteTransactions = async (ids: string[]) => {
  return await prisma.transaction.updateMany({
    where: { id: { in: ids } },
    data: { isDeleted: true }
  });
};

export const cleanupTransactions = async () => {
  const [verifiedTransactions, unverifiedTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { isVerified: true, isDeleted: false },
      select: {
        date: true,
        time: true,
        vendor: true,
        amount: true,
        source: true,
      },
    }),
    prisma.transaction.findMany({
      where: { isVerified: false, isDeleted: false },
      select: {
        id: true,
        date: true,
        time: true,
        type: true,
        vendor: true,
        amount: true,
        source: true,
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
      isVerified: true,
      isDeleted: false
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
