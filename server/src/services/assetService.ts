import prisma from '../db';
import { randomUUID } from 'crypto';

export const getAllAssets = async () => {
  return await prisma.asset.findMany({
    orderBy: { name: 'asc' },
  });
};

export const addAsset = async (data: any) => {
  return await prisma.asset.create({
    data: {
      id: randomUUID(),
      ...data,
    },
  });
};

export const updateAsset = async (id: string, data: any) => {
  return await prisma.asset.update({
    where: { id },
    data,
  });
};

export const deleteAsset = async (id: string) => {
  return await prisma.asset.delete({
    where: { id },
  });
};
