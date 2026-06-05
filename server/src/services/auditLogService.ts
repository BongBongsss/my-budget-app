import { randomUUID } from 'crypto';
import { Asset, Prisma, Transaction } from '@prisma/client';
import prisma from '../db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export type AuditActor = {
  role?: string;
  ipAddress?: string;
};

type AuditInput = {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  beforeData?: unknown;
  afterData?: unknown;
  actor?: AuditActor;
};

const toJsonValue = (value: unknown): Prisma.InputJsonValue => {
  if (value === undefined || value === null) {
    return Prisma.JsonNull as unknown as Prisma.InputJsonValue;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

export const buildAuditLogData = ({
  entityType,
  entityId,
  action,
  beforeData,
  afterData,
  actor,
}: AuditInput) => ({
  id: randomUUID(),
  entityType,
  entityId,
  action,
  beforeData: toJsonValue(beforeData),
  afterData: toJsonValue(afterData),
  actorRole: actor?.role || null,
  ipAddress: actor?.ipAddress || null,
});

export const getAuditLogs = async (filters: {
  entityType?: string;
  action?: string;
  limit?: number;
  page?: number;
}) => {
  const limit = Math.min(Math.max(filters.limit || 10, 1), 100);
  const page = Math.max(filters.page || 1, 1);
  const skip = (page - 1) * limit;
  const where = {
    entityType: filters.entityType || undefined,
    action: filters.action || undefined,
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);
  const restorableEntityTypes = ['transaction', 'importRow', 'asset'];
  const deleteLogs = logs.filter((log) => restorableEntityTypes.includes(log.entityType) && log.action === 'delete');
  const restoreLogs = deleteLogs.length > 0
    ? await prisma.auditLog.findMany({
        where: {
          action: 'restore',
          OR: deleteLogs.map((log) => ({
            entityType: log.entityType,
            entityId: log.entityId,
            createdAt: { gt: log.createdAt },
          })),
        },
        select: {
          entityType: true,
          entityId: true,
          createdAt: true,
        },
      })
    : [];
  const logsWithRestoreState = logs.map((log) => ({
    ...log,
    isRestorable: restorableEntityTypes.includes(log.entityType)
      && log.action === 'delete'
      && !restoreLogs.some((restoreLog) => (
        restoreLog.entityType === log.entityType
        && restoreLog.entityId === log.entityId
        && restoreLog.createdAt.getTime() > log.createdAt.getTime()
      )),
  }));

  return {
    logs: logsWithRestoreState,
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
};

export const restoreTransactionFromAuditLog = async (auditLogId: string, actor: AuditActor) => {
  return prisma.$transaction(async (tx) => {
    const auditLog = await tx.auditLog.findUnique({
      where: { id: auditLogId },
    });

    if (!auditLog || auditLog.action !== 'delete' || !['transaction', 'importRow', 'asset'].includes(auditLog.entityType)) {
      throw new NotFoundError('Restorable delete log not found.');
    }

    if (auditLog.entityType === 'asset') {
      const beforeData = auditLog.beforeData as Partial<Asset> | null;
      if (!beforeData?.id) {
        throw new BadRequestError('Delete log does not contain restorable asset data.');
      }

      const restoreData = {
        name: beforeData.name || 'Restored Asset',
        type: beforeData.type || 'other',
        balance: beforeData.balance || 0,
        memo: beforeData.memo || null,
        isDeleted: false,
      };

      const restored = await tx.asset.upsert({
        where: { id: beforeData.id },
        update: restoreData,
        create: {
          id: beforeData.id,
          ...restoreData,
        },
      });

      await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'asset',
          entityId: restored.id,
          action: 'restore',
          beforeData,
          afterData: restored,
          actor,
        }),
      });

      return restored;
    }

    if (auditLog.entityType === 'importRow') {
      const beforeData = auditLog.beforeData as any;
      if (!beforeData?.id) {
        throw new BadRequestError('Delete log does not contain restorable import row data.');
      }

      const restoreData = {
        batchId: beforeData.batchId || null,
        rowNumber: beforeData.rowNumber ?? null,
        status: beforeData.status || 'new',
        invalidReason: beforeData.invalidReason || null,
        sourceTransactionId: beforeData.sourceTransactionId || null,
        date: beforeData.date || new Date().toISOString().split('T')[0],
        time: beforeData.time || '',
        type: beforeData.type || 'expense',
        category: beforeData.category || '기타',
        subcategory: beforeData.subcategory || null,
        vendor: beforeData.vendor || 'Unknown',
        amount: beforeData.amount || 0,
        currency: beforeData.currency || 'KRW',
        source: beforeData.source || 'file_import',
        memo: beforeData.memo || null,
        member: beforeData.member || 'unknown',
        rawData: (beforeData.rawData || beforeData) as Prisma.InputJsonValue,
        committedAt: null,
        transactionId: null,
      };

      const restored = await tx.importRow.upsert({
        where: { id: beforeData.id },
        update: restoreData,
        create: {
          id: beforeData.id,
          ...restoreData,
        },
      });

      await tx.auditLog.create({
        data: buildAuditLogData({
          entityType: 'importRow',
          entityId: restored.id,
          action: 'restore',
          beforeData,
          afterData: restored,
          actor,
        }),
      });

      return restored;
    }

    const beforeData = auditLog.beforeData as Partial<Transaction> | null;
    if (!beforeData?.id) {
      throw new BadRequestError('Delete log does not contain restorable transaction data.');
    }

    const restoreData = {
      date: beforeData.date || new Date().toISOString().split('T')[0],
      time: beforeData.time || '',
      type: beforeData.type || 'expense',
      category: beforeData.category || '기타',
      subcategory: beforeData.subcategory || null,
      vendor: beforeData.vendor || 'Unknown',
      amount: beforeData.amount || 0,
      currency: beforeData.currency || 'KRW',
      source: beforeData.source || 'restore',
      memo: beforeData.memo || null,
      hash: beforeData.hash || randomUUID(),
      isVerified: beforeData.isVerified ?? true,
      isDuplicate: beforeData.isDuplicate ?? false,
      isDeleted: false,
      member: beforeData.member || '미지정',
    };

    const restored = await tx.transaction.upsert({
      where: { id: beforeData.id },
      update: restoreData,
      create: {
        id: beforeData.id,
        ...restoreData,
      },
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'transaction',
        entityId: restored.id,
        action: 'restore',
        beforeData,
        afterData: restored,
        actor,
      }),
    });

    return restored;
  });
};
