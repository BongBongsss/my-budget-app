import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID } from 'crypto';
import { Transaction } from '@prisma/client';
import { AuditActor, buildAuditLogData } from './auditLogService';
import { ParsedImportRow } from './importService';

type DuplicateComparable = Pick<Transaction, 'date' | 'time' | 'type' | 'vendor' | 'amount' | 'source'>;

const normalizeText = (value: string | null | undefined) => {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

const normalizeAmount = (value: number | null | undefined) => {
  return Math.round(Math.abs(Number(value || 0)) * 100);
};

// Import duplicate matching uses stable source fields only.
// User-edited fields such as category, subcategory, memo, and member are excluded.
const buildDuplicateKey = (tx: Partial<DuplicateComparable>) => {
  return [
    normalizeText(tx.date),
    normalizeText(tx.time),
    normalizeText(tx.type),
    normalizeText(tx.vendor),
    normalizeAmount(tx.amount),
    normalizeText(tx.source),
  ].join('|');
};

const activeImportStatuses = ['new', 'duplicate', 'invalid'];

const mapImportRowToTransaction = (row: any) => ({
  id: row.id,
  date: row.date,
  time: row.time || '',
  type: row.type,
  category: row.category,
  subcategory: row.subcategory || '',
  vendor: row.vendor,
  amount: row.amount,
  currency: row.currency || 'KRW',
  source: row.source || 'file_import',
  memo: row.memo || row.invalidReason || '',
  member: row.member,
  hash: null,
  isVerified: false,
  isDuplicate: row.status === 'duplicate',
  isDeleted: false,
  importStatus: row.status,
  isInvalid: row.status === 'invalid',
  invalidReason: row.invalidReason || '',
  rowNumber: row.rowNumber,
  batchId: row.batchId,
});

export const getAllTransactions = async (): Promise<any[]> => {
  const [transactions, importRows] = await Promise.all([
    prisma.transaction.findMany({
      where: { isDeleted: false, isVerified: true },
      orderBy: { date: 'desc' },
    }),
    prisma.importRow.findMany({
      where: { status: { in: activeImportStatuses } },
      orderBy: [{ createdAt: 'desc' }, { rowNumber: 'asc' }],
    }),
  ]);

  return [
    ...transactions,
    ...importRows.map(mapImportRowToTransaction),
  ];
};

export const stageImportRows = async (rows: ParsedImportRow[], filename?: string, actor?: AuditActor) => {
  const uniqueVendors = Array.from(new Set(
    rows
      .map((row) => row.transaction.vendor)
      .filter((vendor) => vendor && vendor !== 'Unknown')
  ));
  const categoryMap = await bulkAutoCategorize(uniqueVendors);

  const verifiedTransactions = await prisma.transaction.findMany({
    where: { isVerified: true, isDeleted: false },
    select: {
      date: true,
      time: true,
      type: true,
      vendor: true,
      amount: true,
      source: true,
    },
  });
  const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));

  const batchId = randomUUID();
  const dataToInsert = rows.map((row) => {
    const t = row.transaction;
    const normalized = {
      date: t.date || new Date().toISOString().split('T')[0],
      time: (t.time || '').trim(),
      type: (t.type || 'expense').trim(),
      category: t.category || categoryMap[t.vendor] || '기타',
      subcategory: (t.subcategory || '').trim(),
      vendor: (t.vendor || 'Unknown').trim(),
      amount: Math.abs(t.amount || 0),
      currency: (t.currency || 'KRW').trim(),
      source: (t.source || 'file_import').trim(),
      memo: t.memo || null,
      member: (t as any).member || '미지정',
    };
    const status = row.invalidReasons.length > 0
      ? 'invalid'
      : verifiedKeys.has(buildDuplicateKey(normalized))
        ? 'duplicate'
        : 'new';

    return {
      id: randomUUID(),
      batchId,
      rowNumber: row.rowNumber,
      status,
      invalidReason: row.invalidReasons.join('; ') || null,
      ...normalized,
      rawData: row.rawData,
    };
  });

  const archivedCounts = {
    newCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    total: 0,
  };
  const replacementConditions = dataToInsert.map((row) => ({
    date: row.date,
    time: row.time,
    type: row.type,
    vendor: row.vendor,
    amount: row.amount,
    source: row.source,
  }));

  await prisma.$transaction(async (tx) => {
    const replacementWhere = replacementConditions.length > 0
      ? { status: { in: activeImportStatuses }, OR: replacementConditions }
      : null;

    const existingActiveCounts = replacementWhere
      ? await tx.importRow.groupBy({
          by: ['status'],
          where: replacementWhere,
          _count: { _all: true },
        })
      : [];

    existingActiveCounts.forEach((row) => {
      if (row.status === 'new') archivedCounts.newCount = row._count._all;
      if (row.status === 'duplicate') archivedCounts.duplicateCount = row._count._all;
      if (row.status === 'invalid') archivedCounts.invalidCount = row._count._all;
      archivedCounts.total += row._count._all;
    });

    if (replacementWhere) {
      await tx.importRow.updateMany({
        where: replacementWhere,
        data: { status: 'ignored' },
      });
    }

    await tx.importBatch.create({
      data: {
        id: batchId,
        filename,
        totalRows: rows.length,
      },
    });

    if (dataToInsert.length > 0) {
      await tx.importRow.createMany({
        data: dataToInsert as any,
      });

      await tx.auditLog.createMany({
        data: dataToInsert.map((row) => buildAuditLogData({
          entityType: 'importRow',
          entityId: row.id,
          action: 'create',
          afterData: row,
          actor,
        })),
      });
    }
  });

  return {
    batchId,
    total: rows.length,
    newCount: dataToInsert.filter((row) => row.status === 'new').length,
    duplicateCount: dataToInsert.filter((row) => row.status === 'duplicate').length,
    invalidCount: dataToInsert.filter((row) => row.status === 'invalid').length,
    replaced: archivedCounts,
  };
};

export const bulkAddTransactions = async (transactions: Partial<Transaction>[], actor?: AuditActor) => {
  try {
    const importableTransactions = transactions.filter((t) => {
      const vendor = (t.vendor || '').trim();
      const amount = Math.abs(Number(t.amount || 0));
      return vendor !== '' && vendor !== 'Unknown' && amount > 0;
    });

    const uniqueVendors = Array.from(new Set(importableTransactions.map(t => t.vendor || 'Unknown')));
    const categoryMap = await bulkAutoCategorize(uniqueVendors);

    const verifiedTransactions = await prisma.transaction.findMany({
      where: { isVerified: true, isDeleted: false },
      select: {
        date: true,
        time: true,
        type: true,
        vendor: true,
        amount: true,
        source: true,
      },
    });
    const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));

    const dataToInsert = importableTransactions.map((t) => {
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
      const isDuplicate = verifiedKeys.has(duplicateKey);

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

    if (dataToInsert.length === 0) {
      return [];
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.createMany({
        data: dataToInsert as any,
        skipDuplicates: false,
      });

      await tx.auditLog.createMany({
        data: dataToInsert.map((transaction) => buildAuditLogData({
          entityType: 'transaction',
          entityId: transaction.id,
          action: 'create',
          afterData: transaction,
          actor,
        })),
      });
    });

    return dataToInsert;
  } catch (error) {
    console.error('Import Error:', error);
    throw error;
  }
};

export const verifyTransactions = async (ids: string[]) => {
  return await prisma.$transaction(async (tx) => {
    const importRows = await tx.importRow.findMany({
      where: {
        id: { in: ids },
        status: { in: ['new', 'duplicate'] },
      },
    });
    const importRowIds = importRows.map((row) => row.id);
    const legacyIds = ids.filter((id) => !importRowIds.includes(id));

    if (importRows.length > 0) {
      const transactionsToCreate = importRows.map((row) => ({
        id: randomUUID(),
        date: row.date,
        time: row.time || '',
        type: row.type,
        category: row.category,
        subcategory: row.subcategory || null,
        vendor: row.vendor,
        amount: Math.abs(row.amount || 0),
        currency: row.currency || 'KRW',
        source: row.source || 'file_import',
        memo: row.memo || null,
        member: row.member,
        hash: randomUUID(),
        isVerified: true,
        isDuplicate: false,
        isDeleted: false,
      }));

      await tx.transaction.createMany({
        data: transactionsToCreate,
      });

      for (let i = 0; i < importRows.length; i++) {
        await tx.importRow.update({
          where: { id: importRows[i].id },
          data: {
            status: 'committed',
            committedAt: new Date(),
            transactionId: transactionsToCreate[i].id,
          },
        });
      }
    }

    const legacyResult = legacyIds.length > 0
      ? await tx.transaction.updateMany({
          where: { id: { in: legacyIds } },
          data: { isVerified: true },
        })
      : { count: 0 };

    return { count: legacyResult.count + importRows.length };
  });
};

export const addTransaction = async (transaction: Partial<Transaction>, actor?: AuditActor) => {
  const category = transaction.category || await autoCategorize(transaction.vendor || 'Unknown');
  return await prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({
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

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: created.id,
        action: 'create',
        afterData: created,
        actor,
      }),
    });

    return created;
  });
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>, actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const before = await tx.transaction.findUnique({
      where: { id },
    });

    if (!before) {
      const importBefore = await tx.importRow.findUnique({ where: { id } });
      if (!importBefore) {
        throw new Error('Transaction not found');
      }

      const allowedUpdates = {
        date: updates.date,
        time: updates.time,
        type: updates.type,
        category: updates.category,
        subcategory: updates.subcategory,
        vendor: updates.vendor,
        amount: updates.amount,
        currency: updates.currency,
        source: updates.source,
        memo: updates.memo,
        member: updates.member,
      };
      const data = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([, value]) => value !== undefined)
      );

      const updatedImportRow = await tx.importRow.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'importRow',
          entityId: id,
          action: 'update',
          beforeData: importBefore,
          afterData: updatedImportRow,
          actor,
        }),
      });

      return mapImportRowToTransaction(updatedImportRow);
    }

    const updated = await tx.transaction.update({
      where: { id },
      data: updates,
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: id,
        action: 'update',
        beforeData: before,
        afterData: updated,
        actor,
      }),
    });

    return updated;
  });
};

export const deleteTransaction = async (id: string, actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const before = await tx.transaction.findUnique({
      where: { id },
    });

    if (!before) {
      const importBefore = await tx.importRow.findUnique({ where: { id } });
      if (!importBefore) {
        throw new Error('Transaction not found');
      }

      const ignored = await tx.importRow.update({
        where: { id },
        data: { status: 'ignored' },
      });

      await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'importRow',
          entityId: id,
          action: 'delete',
          beforeData: importBefore,
          afterData: ignored,
          actor,
        }),
      });

      return ignored;
    }

    const deleted = await tx.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: id,
        action: 'delete',
        beforeData: before,
        afterData: deleted,
        actor,
      }),
    });

    return deleted;
  });
};

export const bulkDeleteTransactions = async (ids: string[], actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const beforeItems = await tx.transaction.findMany({
      where: { id: { in: ids } },
    });
    const transactionIds = beforeItems.map((item) => item.id);
    const importRowIds = ids.filter((id) => !transactionIds.includes(id));
    const beforeImportRows = importRowIds.length > 0
      ? await tx.importRow.findMany({ where: { id: { in: importRowIds } } })
      : [];

    const result = await tx.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { isDeleted: true },
    });

    if (beforeImportRows.length > 0) {
      await tx.importRow.updateMany({
        where: { id: { in: beforeImportRows.map((row) => row.id) } },
        data: { status: 'ignored' },
      });
    }

    await tx.auditLog.createMany({
      data: [
        ...beforeItems.map((before) => buildAuditLogData({
          entityType: 'transaction',
          entityId: before.id,
          action: 'delete',
          beforeData: before,
          afterData: { ...before, isDeleted: true },
          actor,
        })),
        ...beforeImportRows.map((before) => buildAuditLogData({
          entityType: 'importRow',
          entityId: before.id,
          action: 'delete',
          beforeData: before,
          afterData: { ...before, status: 'ignored' },
          actor,
        })),
      ],
    });

    return { count: result.count + beforeImportRows.length };
  });
};

export const cleanupTransactions = async () => {
  const [verifiedTransactions, importRows] = await Promise.all([
    prisma.transaction.findMany({
      where: { isVerified: true, isDeleted: false },
      select: {
        date: true,
        time: true,
        type: true,
        vendor: true,
        amount: true,
        source: true,
      },
    }),
    prisma.importRow.findMany({
      where: { status: { in: ['new', 'duplicate'] } },
      select: {
        id: true,
        date: true,
        time: true,
        type: true,
        vendor: true,
        amount: true,
        source: true,
        status: true,
      },
    }),
  ]);

  const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));
  let updatedCount = 0;

  for (const tx of importRows) {
    const shouldBeDuplicate = verifiedKeys.has(buildDuplicateKey(tx));
    const nextStatus = shouldBeDuplicate ? 'duplicate' : 'new';
    if (tx.status !== nextStatus) {
      await prisma.importRow.update({
        where: { id: tx.id },
        data: { status: nextStatus },
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
