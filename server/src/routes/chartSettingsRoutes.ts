import { Request, Response, Router } from 'express';
import prisma from '../db';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

const router = Router();
const defaultSettings = { income: [], expense: [] };

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.$queryRawUnsafe<any[]>('SELECT "excludedGroups" FROM "ChartStatisticsSettings" WHERE "id" = $1', 'default');
  res.json(rows[0]?.excludedGroups || defaultSettings);
}));

router.put('/', asyncHandler(async (req: Request, res: Response) => {
  const settings = req.body;
  if (!Array.isArray(settings?.income) || !Array.isArray(settings?.expense) || [...settings.income, ...settings.expense].some((value) => typeof value !== 'string')) throw new BadRequestError('Invalid chart statistics settings.');
  await prisma.$executeRawUnsafe('INSERT INTO "ChartStatisticsSettings" ("id", "excludedGroups", "updatedAt") VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO UPDATE SET "excludedGroups" = EXCLUDED."excludedGroups", "updatedAt" = CURRENT_TIMESTAMP', 'default', JSON.stringify(settings));
  res.json(settings);
}));

export default router;
