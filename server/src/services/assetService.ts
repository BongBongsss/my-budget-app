import prisma from '../db';
import { randomUUID } from 'crypto';

const updateHistory = async () => {
  const assets = await prisma.asset.findMany();
  const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
  const netAssets = totalAssets - totalLiabilities;
  const yearMonth = new Date().toISOString().substring(0, 7);

  await prisma.assetHistory.upsert({
    where: { yearMonth },
    update: { totalAssets, totalLiabilities, netAssets },
    create: { yearMonth, totalAssets, totalLiabilities, netAssets },
  });
};

export const getAllAssets = async () => {
  return await prisma.asset.findMany({
    orderBy: { name: 'asc' },
  });
};

export const addAsset = async (data: any) => {
  const asset = await prisma.asset.create({
    data: {
      id: randomUUID(),
      ...data,
    },
  });
  await updateHistory();
  return asset;
};

export const updateAsset = async (id: string, data: any) => {
  const asset = await prisma.asset.update({
    where: { id },
    data,
  });
  await updateHistory();
  return asset;
};

export const deleteAsset = async (id: string) => {
  const asset = await prisma.asset.delete({
    where: { id },
  });
  await updateHistory();
  return asset;
};
