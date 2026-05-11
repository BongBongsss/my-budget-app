import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

// 데이터의 고유 지문(hash) 생성 함수
const generateHash = (
  date: string, 
  amount: number, 
  vendor: string, 
  time: string = '', 
  source: string = '', 
  type: string = '',
  category: string = '',
  subcategory: string = '',
  currency: string = '',
  sequence: number = 0
) => {
  const nDate = (date || '').trim();
  const nTime = (time || '').trim();
  const nType = (type || '').trim();
  const nCat = (category || '').trim();
  const nSub = (subcategory || '').trim();
  const nVen = (vendor || '').trim();
  const nAmt = Math.abs(amount);
  const nCur = (currency || '').trim();
  const nSrc = (source || '').trim();
  
  return createHash('sha256')
    .update(`${nDate}-${nTime}-${nType}-${nCat}-${nSub}-${nVen}-${nAmt}-${nCur}-${nSrc}-${sequence}`)
    .digest('hex');
};

export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
  });
};

export const cleanupTransactions = async () => {
  return { updatedCount: 0, deletedCount: 0 };
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[]) => {
  try {
    const uniqueVendors = Array.from(new Set(transactions.map(t => t.vendor || 'Unknown')));
    const categoryMap = await bulkAutoCategorize(uniqueVendors);

    const processedTransactions = transactions.map((t) => ({
      ...t,
      finalCategory: t.category || categoryMap[t.vendor || 'Unknown'] || '기타'
    }));

    const uniqueCategories = Array.from(new Set(processedTransactions.map(t => t.finalCategory).filter(Boolean)));
    for (const name of uniqueCategories) {
      if (name) {
        await prisma.category.upsert({
          where: { name },
          update: {},
          create: { id: randomUUID(), name }
        });
      }
    }

    const dataToInsert = processedTransactions.map((t, i) => ({
        id: randomUUID(),
        date: t.date || new Date().toISOString().split('T')[0],
        time: (t.time || '').trim(),
        type: (t.type || 'expense').trim(),
        category: (t.finalCategory || '기타').trim(),
        subcategory: (t.subcategory || '').trim(),
        vendor: (t.vendor || 'Unknown').trim(),
        amount: Math.abs(t.amount || 0),
        currency: (t.currency || 'KRW').trim(),
        source: (t.source || 'file_import').trim(),
        memo: t.memo || null,
        hash: generateHash(t.date || '', t.amount || 0, t.vendor || '', t.time || '', t.source || '', t.type || '', t.category || '', t.subcategory || '', t.currency || '', i + 40000),
        isVerified: false,
        isDuplicate: false
    }));

    if (dataToInsert.length > 0) {
      await prisma.transaction.createMany({
        data: dataToInsert as any,
        skipDuplicates: true,
      });
    }

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

export const applyAutoRulesToExisting = async () => {
  const transactions = await prisma.transaction.findMany({
    where: { NOT: [{ category: '기타' }, { category: '' }] }
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
