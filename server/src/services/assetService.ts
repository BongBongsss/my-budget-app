import prisma from '../db';
import { randomUUID } from 'crypto';
import { AuditActor, buildAuditLogData } from './auditLogService';
import { getLiabilityTypeIds } from './assetTypeService';

const pickAssetInput = (data: any) => {
  const input: any = {};
  if (data.name !== undefined) input.name = data.name;
  if (data.type !== undefined) input.type = data.type;
  if (data.balance !== undefined) input.balance = data.balance;
  if (data.member !== undefined) input.member = data.member;
  if (data.memo !== undefined) input.memo = data.memo;
  return input;
};

export const saveAssetHistory = async () => {
  const assets = await prisma.asset.findMany({
    where: { isDeleted: false }
  });
  const liabilityTypeIds = new Set(await getLiabilityTypeIds());
  const totalAssets = assets.reduce((sum: number, a: any) => !liabilityTypeIds.has(a.type) ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum: number, a: any) => liabilityTypeIds.has(a.type) ? sum + a.balance : sum, 0);
  const netAssets = totalAssets - totalLiabilities;
  const yearMonth = new Date().toISOString().substring(0, 7);

  return await prisma.assetHistory.upsert({
    where: { yearMonth },
    update: { totalAssets, totalLiabilities, netAssets },
    create: { yearMonth, totalAssets, totalLiabilities, netAssets },
  });
};

export const getAssetHistory = async () => {
  return await prisma.assetHistory.findMany({
    orderBy: { yearMonth: 'asc' },
  });
};

export const getAllAssets = async () => {
  return await prisma.asset.findMany({
    where: { isDeleted: false },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' }
    ],
  });
};

export const addAsset = async (data: any, actor?: AuditActor) => {
  const asset = await prisma.$transaction(async (tx) => {
    const created = await tx.asset.create({
      data: {
        id: randomUUID(),
        ...pickAssetInput(data),
        isDeleted: false
      },
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'asset',
        entityId: created.id,
        action: 'create',
        afterData: created,
        actor,
      }),
    });

    return created;
  });
  await saveAssetHistory();
  return asset;
};

export const updateAsset = async (id: string, data: any, actor?: AuditActor) => {
  const asset = await prisma.$transaction(async (tx) => {
    const before = await tx.asset.findUnique({ where: { id } });
    const updated = await tx.asset.update({
      where: { id },
      data: pickAssetInput(data),
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'asset',
        entityId: updated.id,
        action: 'update',
        beforeData: before,
        afterData: updated,
        actor,
      }),
    });

    return updated;
  });
  await saveAssetHistory();
  return asset;
};

export const deleteAsset = async (id: string, actor?: AuditActor) => {
  const asset = await prisma.$transaction(async (tx) => {
    const before = await tx.asset.findUnique({ where: { id } });
    const deleted = await tx.asset.update({
      where: { id },
      data: { isDeleted: true }
    });

    await tx.auditLog.create({
      data: buildAuditLogData({
        entityType: 'asset',
        entityId: deleted.id,
        action: 'delete',
        beforeData: before,
        afterData: deleted,
        actor,
      }),
    });

    return deleted;
  });
  await saveAssetHistory();
  return asset;
};
