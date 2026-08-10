import prisma from '../db';
import { randomUUID } from 'crypto';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

const normalizeName = (name: unknown) => typeof name === 'string' ? name.trim() : '';

export const getAssetTypes = () => prisma.assetType.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'asc' } });

export const addAssetType = async (name: unknown, isLiability = false) => {
  const normalized = normalizeName(name);
  if (!normalized) throw new BadRequestError('Asset type name is required.');
  const existing = await prisma.assetType.findFirst({ where: { name: normalized } });
  if (existing) throw new ConflictError('Asset type name already exists.');
  return prisma.assetType.create({ data: { id: `custom-${randomUUID()}`, name: normalized, isLiability: Boolean(isLiability) } });
};

export const updateAssetType = async (id: string, name: unknown, isLiability: unknown) => {
  const normalized = normalizeName(name);
  if (!normalized) throw new BadRequestError('Asset type name is required.');
  const type = await prisma.assetType.findUnique({ where: { id } });
  if (!type || type.isDeleted) throw new NotFoundError('Asset type not found.');
  const duplicate = await prisma.assetType.findFirst({ where: { name: normalized, id: { not: id } } });
  if (duplicate) throw new ConflictError('Asset type name already exists.');
  return prisma.assetType.update({ where: { id }, data: { name: normalized, isLiability: Boolean(isLiability) } });
};

export const deleteAssetType = async (id: string) => {
  const type = await prisma.assetType.findUnique({ where: { id } });
  if (!type || type.isDeleted) throw new NotFoundError('Asset type not found.');
  const inUse = await prisma.asset.count({ where: { type: id, isDeleted: false } });
  if (inUse > 0) throw new ConflictError('Asset type is in use and cannot be deleted.');
  return prisma.assetType.update({ where: { id }, data: { isDeleted: true } });
};

export const getLiabilityTypeIds = async () => (await prisma.assetType.findMany({ where: { isDeleted: false, isLiability: true }, select: { id: true } })).map((type) => type.id);
