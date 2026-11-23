import { Prisma } from '@prisma/client';
import prisma from '../db';
import { DatabaseError } from '../utils/errors';
import { MailExclusions, makeMonthlyMailReport, reportMonth } from './monthlyMailReport';

function validExclusions(value: unknown): value is MailExclusions {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return Array.isArray(settings.income) && Array.isArray(settings.expense) && [...settings.income, ...settings.expense].every(item => typeof item === 'string');
}

export async function getMonthlyMailReport(period: string) {
  reportMonth(period);
  const start = `${reportMonth(period, -3)}-01`;
  const end = `${reportMonth(period, 1)}-01`;
  return prisma.$transaction(async tx => {
    const [rows, pending, categories, settings] = await Promise.all([
      tx.transaction.findMany({ where: { isDeleted: false, isVerified: true, date: { gte: start, lt: end } }, select: { date: true, amount: true, type: true, category: true, member: true } }),
      tx.importRow.findMany({ where: { status: { in: ['new', 'duplicate', 'invalid'] }, date: { gte: start, lt: end } }, select: { date: true } }),
      tx.category.findMany({ where: { isDeleted: false }, select: { name: true, groupName: true }, orderBy: { name: 'asc' } }),
      tx.$queryRaw<{ excludedGroups: Prisma.JsonValue }[]>`SELECT "excludedGroups" FROM "ChartStatisticsSettings" WHERE "id" = ${'default'}`,
    ]);
    const exclusions: unknown = settings[0]?.excludedGroups ?? { income: [], expense: [] };
    if (!validExclusions(exclusions)) throw new DatabaseError('Invalid chart statistics settings.');
    return makeMonthlyMailReport({ period, rows, pendingDates: pending.map(row => row.date).filter((date): date is string => date !== null), categories, exclusions });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
