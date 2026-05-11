import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID, createHash } from 'crypto';
import { Transaction } from '@prisma/client';

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

    const existingTransactions = await prisma.transaction.findMany({
      select: { 
        date: true, time: true, type: true, category: true, subcategory: true, 
        vendor: true, amount: true, currency: true, source: true
      }
    });

    const dbOccurrenceMap: Record<string, number> = {};
    for (const tx of existingTransactions) {
      const key = `${tx.date}-${(tx.time || '').trim()}-${(tx.type || '').trim()}-${(tx.category || '').trim()}-${(tx.subcategory || '').trim()}-${(tx.vendor || '').trim()}-${Math.abs(tx.amount)}-${(tx.currency || '').trim()}-${(tx.source || '').trim()}`;
      dbOccurrenceMap[key] = (dbOccurrenceMap[key] || 0) + 1;
    }

    const dataToInsert = [];
    const fullResultList = [];
    const batchOccurrenceMap: Record<string, number> = {};

    for (let i = 0; i < processedTransactions.length; i++) {
      const transaction = processedTransactions[i];
      const date = transaction.date || new Date().toISOString().split('T')[0];
      const amount = Math.abs(transaction.amount || 0);
      const vendor = (transaction.vendor || 'Unknown').trim();
      const time = (transaction.time || '').trim();
      const type = (transaction.type || 'expense').trim();
      const category = (transaction.finalCategory || '기타').trim();
      const subcategory = (transaction.subcategory || '').trim();
      const currency = (transaction.currency || 'KRW').trim();
      const source = (transaction.source || 'file_import').trim();

      const key = `${date}-${time}-${type}-${category}-${subcategory}-${vendor}-${amount}-${currency}-${source}`;
      
      const currentBatchCount = (batchOccurrenceMap[key] || 0) + 1;
      batchOccurrenceMap[key] = currentBatchCount;

      const existingCountInDb = dbOccurrenceMap[key] || 0;
      const isDuplicate = currentBatchCount <= existingCountInDb;

      const txData = {
        id: randomUUID(),
        date,
        time,
        type,
        category,
        subcategory,
        vendor,
        amount,
        currency,
        source,
        memo: transaction.memo || null,
        hash: generateHash(date, amount, vendor, time, source, type, category, subcategory, currency, i + 30000), 
        isVerified: false, 
        isDuplicate: isDuplicate,
      };

      fullResultList.push(txData);
      dataToInsert.push(txData);
    }

    if (dataToInsert.length > 0) {
      await prisma.transaction.createMany({
        data: dataToInsert as any,
        skipDuplicates: true, 
      });
    }

    return fullResultList;
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
  const date = transaction.date || new Date().toISOString().split('T')[0];
  const time = transaction.time || '';
  const amount = Math.abs(transaction.amount || 0);
  const vendor = (transaction.vendor || 'Unknown').trim();
  const category = transaction.category || await autoCategorize(vendor);
  const source = transaction.source || 'manual';
  const type = transaction.type || 'expense';
  const currency = transaction.currency || 'KRW';
  
  const existingCount = await prisma.transaction.count({
    where: { date, time, amount, vendor, source, type }
  });

  const hash = generateHash(date, amount, vendor, time, source, type, category, '', currency, existingCount);

  return await prisma.transaction.upsert({
    where: { hash: hash },
    update: {}, 
    create: {
      id: randomUUID(),
      date,
      time,
      type: type,
      category: category,
      subcategory: transaction.subcategory || null,
      vendor,
      amount,
      currency: currency,
      source: source,
      memo: transaction.memo || null,
      hash,
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
    where: {
      NOT: [{ category: '기타' }, { category: '' }]
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
