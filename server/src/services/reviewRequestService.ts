import prisma from '../db';
import { Prisma } from '@prisma/client';

export type ReviewTargetType = 'general' | 'transaction' | 'importRow' | 'asset';

const resolveReviewTarget = async (
  client: Prisma.TransactionClient,
  targetType: string | undefined,
  targetId: string | null | undefined,
) => {
  if (targetType === 'importRow' && targetId) {
    const row = await client.importRow.findUnique({ where: { id: targetId } });
    if (row?.status === 'committed' && row.transactionId) {
      return { targetType: 'transaction', targetId: row.transactionId };
    }
  }
  return { targetType, targetId };
};

export const listReviewRequests = async (filters: {
  targetType?: string;
  targetId?: string;
  status?: string;
} = {}) => {
  const target = await resolveReviewTarget(prisma, filters.targetType, filters.targetId);
  return prisma.reviewRequest.findMany({
    where: {
      ...(target.targetType ? { targetType: target.targetType } : {}),
      ...(target.targetId ? { targetId: target.targetId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createReviewRequest = async (data: {
  targetType: ReviewTargetType;
  targetId?: string | null;
  type?: string;
  title: string;
  body: string;
  authorRole?: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const target = await resolveReviewTarget(tx, data.targetType, data.targetId);
    return tx.reviewRequest.create({
      data: {
        targetType: target.targetType!,
        targetId: target.targetId || null,
        type: data.type || 'question',
        title: data.title.trim(),
        body: data.body.trim(),
        authorRole: data.authorRole,
        status: 'open',
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

export const createBulkReviewRequests = async (data: {
  targets: Array<{ targetType: ReviewTargetType; targetId: string; title: string }>;
  body: string;
  authorRole?: string;
}) => {
  return prisma.$transaction(async (tx) => Promise.all(data.targets.map(async (original) => {
    const target = await resolveReviewTarget(tx, original.targetType, original.targetId);
    return tx.reviewRequest.create({
      data: {
        targetType: target.targetType!,
        targetId: target.targetId,
        type: 'question',
        title: original.title.trim(),
        body: data.body.trim(),
        authorRole: data.authorRole,
        status: 'open',
      },
    });
  })), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

export const updateReviewRequestStatus = async (id: string, status: 'open' | 'done') => {
  return prisma.reviewRequest.update({
    where: { id },
    data: { status },
  });
};

export const deleteReviewRequest = async (id: string) => {
  return prisma.reviewRequest.delete({ where: { id } });
};

export const getReviewSummaries = async (targets: Array<{ targetType: string; targetId: string }>) => {
  if (targets.length === 0) return new Map<string, { reviewCount: number; openReviewCount: number; reviewStatus: string }>();

  const conditions = targets.map((target) => ({
    targetType: target.targetType,
    targetId: target.targetId,
  }));

  const requests = await prisma.reviewRequest.findMany({
    where: { OR: conditions },
    select: { targetType: true, targetId: true, status: true },
  });

  const summaries = new Map<string, { reviewCount: number; openReviewCount: number; reviewStatus: string }>();
  for (const target of targets) {
    summaries.set(`${target.targetType}:${target.targetId}`, {
      reviewCount: 0,
      openReviewCount: 0,
      reviewStatus: 'none',
    });
  }

  for (const request of requests) {
    if (!request.targetId) continue;
    const key = `${request.targetType}:${request.targetId}`;
    const summary = summaries.get(key);
    if (!summary) continue;
    summary.reviewCount += 1;
    if (request.status === 'open') summary.openReviewCount += 1;
    summary.reviewStatus = summary.openReviewCount > 0 ? 'open' : 'resolved';
  }

  for (const summary of summaries.values()) {
    summary.reviewStatus = summary.openReviewCount > 0
      ? 'open'
      : summary.reviewCount > 0
        ? 'resolved'
        : 'none';
  }

  return summaries;
};
