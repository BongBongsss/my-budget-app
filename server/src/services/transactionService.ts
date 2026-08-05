import prisma from '../db';
import { autoCategorize, bulkAutoCategorize } from './categoryService';
import { randomUUID } from 'crypto';
import { Prisma, Transaction } from '@prisma/client';
import { AuditActor, buildAuditLogData } from './auditLogService';
import { ParsedImportRow } from './importService';
import { getReviewSummaries } from './reviewRequestService';

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

const pickTransactionUpdateData = (updates: Partial<Transaction>) => {
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

  return Object.fromEntries(
    Object.entries(allowedUpdates).filter(([, value]) => value !== undefined)
  );
};

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

  const mappedImportRows = importRows.map(mapImportRowToTransaction);
  const rows = [
    ...transactions.map((transaction) => ({ ...transaction, reviewTargetType: 'transaction' })),
    ...mappedImportRows.map((row) => ({ ...row, reviewTargetType: 'importRow' })),
  ];
  const reviewSummaries = await getReviewSummaries(
    rows
      .filter((row) => row.id)
      .map((row) => ({ targetType: row.reviewTargetType, targetId: row.id }))
  );

  return rows.map((row) => {
    const summary = reviewSummaries.get(`${row.reviewTargetType}:${row.id}`) || {
      reviewCount: 0,
      openReviewCount: 0,
      reviewStatus: 'none',
    };
    return { ...row, ...summary };
  });
};

export const exportTransactionsBackup = async () => {
  const transactions = await prisma.transaction.findMany({
    orderBy: [{ date: 'desc' }, { time: 'desc' }, { id: 'asc' }],
  });

  return {
    version: 1,
    type: 'transactions',
    exportedAt: new Date().toISOString(),
    includesDeleted: true,
    count: transactions.length,
    transactions,
  };
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

export const verifyTransactions = async (ids: string[], actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
    if (uniqueIds.length === 0) return { count: 0 };

    await tx.importRow.updateMany({
      where: {
        id: { in: uniqueIds },
        status: { in: ['new', 'duplicate'] },
      },
      data: { status: 'committing' },
    });

    const importRows = await tx.importRow.findMany({
      where: { id: { in: uniqueIds }, status: 'committing' },
    });
    const importRowIds = importRows.map((row) => row.id);
    const legacyIds = uniqueIds.filter((id) => !importRowIds.includes(id));

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

      const committedAt = new Date();
      await Promise.all(importRows.map((row, index) => tx.importRow.update({
        where: { id: row.id },
        data: {
          status: 'committed',
          committedAt,
          transactionId: transactionsToCreate[index].id,
        },
      })));

      await tx.auditLog.createMany({
        data: [
          ...transactionsToCreate.map((transaction) => buildAuditLogData({
            entityType: 'transaction',
            entityId: transaction.id,
            action: 'create',
            afterData: transaction,
            actor,
          })),
          ...importRows.map((row, index) => buildAuditLogData({
            entityType: 'importRow',
            entityId: row.id,
            action: 'approve',
            beforeData: row,
            afterData: {
              ...row,
              status: 'committed',
              committedAt,
              transactionId: transactionsToCreate[index].id,
            },
            actor,
          })),
        ],
      });
    }

    const legacyResult = legacyIds.length > 0
      ? await tx.transaction.updateMany({
          where: { id: { in: legacyIds } },
          data: { isVerified: true },
        })
      : { count: 0 };

    return { count: legacyResult.count + importRows.length };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
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

      const data = pickTransactionUpdateData(updates);

      const updatedImportRow = await tx.importRow.update({
        where: { id },
        data,
      });

      const auditLog = await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'importRow',
          entityId: id,
          action: 'update',
          beforeData: importBefore,
          afterData: updatedImportRow,
          actor,
        }),
      });

      return { transaction: mapImportRowToTransaction(updatedImportRow), auditLogIds: [auditLog.id] };
    }

    const updated = await tx.transaction.update({
      where: { id },
      data: pickTransactionUpdateData(updates),
    });

    const auditLog = await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: id,
        action: 'update',
        beforeData: before,
        afterData: updated,
        actor,
      }),
    });

    return { transaction: updated, auditLogIds: [auditLog.id] };
  });
};

export const bulkUpdateTransactions = async (ids: string[], updates: Partial<Transaction>, actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const batchId = randomUUID();
    const data = pickTransactionUpdateData(updates);
    if (Object.keys(data).length === 0 || ids.length === 0) {
      return { count: 0, auditLogIds: [] };
    }

    const beforeTransactions = await tx.transaction.findMany({
      where: { id: { in: ids } },
    });
    const transactionIds = beforeTransactions.map((row) => row.id);
    const importRowIds = ids.filter((id) => !transactionIds.includes(id));
    const beforeImportRows = importRowIds.length > 0
      ? await tx.importRow.findMany({ where: { id: { in: importRowIds } } })
      : [];

    if (transactionIds.length > 0) {
      await tx.transaction.updateMany({
        where: { id: { in: transactionIds } },
        data,
      });
    }

    if (beforeImportRows.length > 0) {
      await tx.importRow.updateMany({
        where: { id: { in: beforeImportRows.map((row) => row.id) } },
        data,
      });
    }

    const auditLogs = [
      ...beforeTransactions.map((before) => buildAuditLogData({
        entityType: 'transaction',
        entityId: before.id,
        action: 'update',
        beforeData: before,
        afterData: { ...before, ...data },
        actor,
        batchId,
      })),
      ...beforeImportRows.map((before) => buildAuditLogData({
        entityType: 'importRow',
        entityId: before.id,
        action: 'update',
        beforeData: before,
        afterData: { ...before, ...data },
        actor,
        batchId,
      })),
    ];

    if (auditLogs.length > 0) {
      await tx.auditLog.createMany({ data: auditLogs });
    }

    return { count: transactionIds.length + beforeImportRows.length, auditLogIds: auditLogs.map((log) => log.id) };
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

      const auditLog = await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'importRow',
          entityId: id,
          action: 'delete',
          beforeData: importBefore,
          afterData: ignored,
          actor,
        }),
      });

      return { transaction: mapImportRowToTransaction(ignored), auditLogIds: [auditLog.id] };
    }

    const deleted = await tx.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });

    const auditLog = await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: id,
        action: 'delete',
        beforeData: before,
        afterData: deleted,
        actor,
      }),
    });

    return { transaction: deleted, auditLogIds: [auditLog.id] };
  });
};

export const bulkDeleteTransactions = async (ids: string[], actor?: AuditActor) => {
  return await prisma.$transaction(async (tx) => {
    const batchId = randomUUID();
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

    const auditLogs = [
        ...beforeItems.map((before) => buildAuditLogData({
          entityType: 'transaction',
          entityId: before.id,
          action: 'delete',
          beforeData: before,
          afterData: { ...before, isDeleted: true },
          actor,
          batchId,
        })),
        ...beforeImportRows.map((before) => buildAuditLogData({
          entityType: 'importRow',
          entityId: before.id,
          action: 'delete',
          beforeData: before,
          afterData: { ...before, status: 'ignored' },
          actor,
          batchId,
        })),
      ];

    if (auditLogs.length > 0) {
      await tx.auditLog.createMany({ data: auditLogs });
    }

    return { count: result.count + beforeImportRows.length, auditLogIds: auditLogs.map((log) => log.id) };
  });
};

export const cleanupTransactions = async (actor?: AuditActor) => {
  return prisma.$transaction(async (tx) => {
    const [verifiedTransactions, importRows] = await Promise.all([
      tx.transaction.findMany({
        where: { isVerified: true, isDeleted: false },
        select: { date: true, time: true, type: true, vendor: true, amount: true, source: true },
      }),
      tx.importRow.findMany({ where: { status: { in: ['new', 'duplicate'] } } }),
    ]);

    const verifiedKeys = new Set(verifiedTransactions.map(buildDuplicateKey));
    const changes = importRows
      .map((row) => ({ ...row, nextStatus: verifiedKeys.has(buildDuplicateKey(row)) ? 'duplicate' : 'new' }))
      .filter((row) => row.status !== row.nextStatus);
    if (changes.length === 0) return { updatedCount: 0, deletedCount: 0, auditLogIds: [] };

    const batchId = randomUUID();
    const nextDuplicateIds = changes.filter((row) => row.nextStatus === 'duplicate').map((row) => row.id);
    const nextNewIds = changes.filter((row) => row.nextStatus === 'new').map((row) => row.id);
    await Promise.all([
      nextDuplicateIds.length > 0
        ? tx.importRow.updateMany({ where: { id: { in: nextDuplicateIds } }, data: { status: 'duplicate' } })
        : Promise.resolve(),
      nextNewIds.length > 0
        ? tx.importRow.updateMany({ where: { id: { in: nextNewIds } }, data: { status: 'new' } })
        : Promise.resolve(),
    ]);
    const auditLogs = changes.map((row) => buildAuditLogData({
      entityType: 'importRow',
      entityId: row.id,
      action: 'update',
      beforeData: row,
      afterData: { ...row, status: row.nextStatus },
      actor,
      batchId,
    }));
    await tx.auditLog.createMany({ data: auditLogs });

    return { updatedCount: changes.length, deletedCount: 0, auditLogIds: auditLogs.map((log) => log.id) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

export const applyAutoRulesToExisting = async (actor?: AuditActor) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      NOT: [{ category: '기타' }, { category: '' }],
      isVerified: true,
      isDeleted: false
    }
  });

  const categoryMap = await bulkAutoCategorize(transactions.map((transaction) => transaction.vendor));

  return prisma.$transaction(async (tx) => {
    const currentTransactions = await tx.transaction.findMany({
      where: {
        id: { in: transactions.map((transaction) => transaction.id) },
        isVerified: true,
        isDeleted: false,
      },
    });
    const changes: Array<{ before: Transaction; category: string }> = [];
    for (const current of currentTransactions) {
      const newCategory = categoryMap[current.vendor] || '기타';
      if (newCategory !== '기타' && newCategory !== current.category) {
        changes.push({ before: current, category: newCategory });
      }
    }
    if (changes.length === 0) return { count: 0, auditLogIds: [] };

    const batchId = randomUUID();
    await Promise.all(changes.map((change) => tx.transaction.update({
      where: { id: change.before.id },
      data: { category: change.category },
    })));
    const auditLogs = changes.map((change) => buildAuditLogData({
      entityType: 'transaction',
      entityId: change.before.id,
      action: 'update',
      beforeData: change.before,
      afterData: { ...change.before, category: change.category },
      actor,
      batchId,
    }));
    await tx.auditLog.createMany({ data: auditLogs });
    return { count: changes.length, auditLogIds: auditLogs.map((log) => log.id) };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};
