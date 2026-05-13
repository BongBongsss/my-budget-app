import prisma from '../db';
import { randomUUID } from 'crypto';

export const saveAssetHistory = async () => {
  const assets = await prisma.asset.findMany({
    where: { isDeleted: false }
  });
  const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
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

export const addAsset = async (data: any) => {
  const asset = await prisma.asset.create({
    data: {
      id: randomUUID(),
      ...data,
      isDeleted: false
    },
  });
  await saveAssetHistory();
  return asset;
};

export const updateAsset = async (id: string, data: any) => {
  const asset = await prisma.asset.update({
    where: { id },
    data,
  });
  await saveAssetHistory();
  return asset;
};

export const deleteAsset = async (id: string) => {
  const asset = await prisma.asset.update({
    where: { id },
    data: { isDeleted: true }
  });
  await saveAssetHistory();
  return asset;
};
