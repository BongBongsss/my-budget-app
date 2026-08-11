import prisma from '../db';
import { randomUUID } from 'crypto';
import { normalizeRuleText } from './ruleMatching';
import { buildAuditLogData, AuditActor } from './auditLogService';

const DEFER_DAYS = 30;

type RecurringInput = {
  vendor: string;
  amount: number;
  category: string;
  type?: 'income' | 'expense';
  day_of_month: number;
  member?: string;
  isVariable?: boolean;
  memo?: string;
};

const getDay = (date: string) => Number(date.slice(-2));
const getMonthKey = (date: string) => date.slice(0, 7);
const sameScheduledDay = (days: number[]) => Math.max(...days) - Math.min(...days) <= 5;
const getCurrentYearMonth = () => new Date().toISOString().slice(0, 7);
const hasMatchingTransaction = (item: { vendor: string; type: string; day_of_month: number }, transactions: Array<{ vendor: string; type: string; date: string }>) => {
  const itemVendor = normalizeRuleText(item.vendor);
  return transactions.some((transaction) => transaction.type === item.type && Math.abs(getDay(transaction.date) - item.day_of_month) <= 5 && (
    normalizeRuleText(transaction.vendor).includes(itemVendor) || itemVendor.includes(normalizeRuleText(transaction.vendor))
  ));
};

export const getAllRecurringTransactions = async () => prisma.recurringTransaction.findMany({
  where: { type: 'expense' },
  orderBy: [{ isActive: 'desc' }, { day_of_month: 'asc' }, { vendor: 'asc' }],
});

export const addRecurringTransaction = async (data: RecurringInput) => prisma.recurringTransaction.create({
  data: {
    id: randomUUID(), vendor: data.vendor.trim(), amount: Math.abs(data.amount), category: data.category,
    type: 'expense', day_of_month: data.day_of_month, member: data.member || 'shared',
    isVariable: Boolean(data.isVariable), memo: data.memo?.trim() || null,
  },
});

export const updateRecurringTransaction = async (id: string, data: Partial<RecurringInput & { isActive: boolean }>) => prisma.recurringTransaction.update({
  where: { id },
  data: {
    ...(data.vendor !== undefined ? { vendor: data.vendor.trim() } : {}),
    ...(data.amount !== undefined ? { amount: Math.abs(data.amount) } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.type !== undefined ? { type: 'expense' } : {}),
    ...(data.day_of_month !== undefined ? { day_of_month: data.day_of_month } : {}),
    ...(data.member !== undefined ? { member: data.member } : {}),
    ...(data.isVariable !== undefined ? { isVariable: data.isVariable } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    ...(data.memo !== undefined ? { memo: data.memo?.trim() || null } : {}),
  },
});

export const deleteRecurringTransaction = async (id: string) => prisma.recurringTransaction.delete({ where: { id } });

export const getRecurringCandidates = async () => {
  const [transactions, existing, ignored, deferred] = await Promise.all([
    prisma.transaction.findMany({ where: { isVerified: true, isDeleted: false, type: 'expense', source: { not: 'recurring' } }, select: { vendor: true, category: true, type: true, amount: true, date: true, member: true } }),
    prisma.recurringTransaction.findMany({ select: { vendor: true } }),
    prisma.ignoredRecurringSuggestion.findMany({ select: { vendorKey: true } }),
    prisma.deferredRecurringSuggestion.findMany({ where: { deferredUntil: { gt: new Date() } }, select: { vendorKey: true } }),
  ]);
  const excluded = new Set([...existing.map((item) => normalizeRuleText(item.vendor)), ...ignored.map((item) => item.vendorKey), ...deferred.map((item) => item.vendorKey)]);
  const groups = new Map<string, typeof transactions>();
  transactions.forEach((transaction) => {
    const key = `${normalizeRuleText(transaction.vendor)}|${transaction.type}|${transaction.member}`;
    if (!normalizeRuleText(transaction.vendor)) return;
    const list = groups.get(key) || [];
    list.push(transaction);
    groups.set(key, list);
  });
  return [...groups.values()].flatMap((list) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const vendorKey = normalizeRuleText(sorted[0].vendor);
    if (excluded.has(vendorKey)) return [];
    const months = new Set(sorted.map((item) => getMonthKey(item.date)));
    const days = sorted.map((item) => getDay(item.date));
    if (months.size < 3 || !sameScheduledDay(days)) return [];
    const amount = sorted.reduce((sum, item) => sum + item.amount, 0) / sorted.length;
    const maxDifference = Math.max(...sorted.map((item) => Math.abs(item.amount - amount)));
    const categoryCounts = new Map<string, number>();
    sorted.forEach((item) => categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1));
    const category = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return [{
      id: vendorKey, vendor: sorted[sorted.length - 1].vendor, type: sorted[0].type, member: sorted[0].member,
      category, occurrenceCount: sorted.length, monthCount: months.size,
      averageAmount: Math.round(amount), minAmount: Math.min(...sorted.map((item) => item.amount)), maxAmount: Math.max(...sorted.map((item) => item.amount)),
      dayOfMonth: Math.round(days.reduce((sum, day) => sum + day, 0) / days.length),
      isVariable: maxDifference > amount * 0.15, lastUsedAt: sorted[sorted.length - 1].date,
    }];
  }).sort((a, b) => b.monthCount - a.monthCount || b.occurrenceCount - a.occurrenceCount);
};

export const deferRecurringCandidate = async (vendor: string) => {
  const vendorKey = normalizeRuleText(vendor);
  const deferredUntil = new Date(); deferredUntil.setDate(deferredUntil.getDate() + DEFER_DAYS);
  return prisma.deferredRecurringSuggestion.upsert({ where: { vendorKey }, update: { deferredUntil }, create: { id: randomUUID(), vendorKey, deferredUntil } });
};

export const ignoreRecurringCandidate = async (vendor: string) => {
  const vendorKey = normalizeRuleText(vendor);
  return prisma.ignoredRecurringSuggestion.upsert({ where: { vendorKey }, update: {}, create: { id: randomUUID(), vendorKey } });
};

export const getIgnoredRecurringCandidates = async () => prisma.ignoredRecurringSuggestion.findMany({ orderBy: { createdAt: 'desc' } });

export const restoreIgnoredRecurringCandidate = async (vendorKey: string) => prisma.ignoredRecurringSuggestion.delete({ where: { vendorKey } });

export const getMissingRecurringTransactions = async (yearMonth = getCurrentYearMonth()) => {
  const [items, transactions] = await Promise.all([
    prisma.recurringTransaction.findMany({ where: { isActive: true, type: 'expense' }, orderBy: { day_of_month: 'asc' } }),
    prisma.transaction.findMany({ where: { isVerified: true, isDeleted: false, date: { startsWith: yearMonth } }, select: { vendor: true, type: true, date: true } }),
  ]);
  const today = new Date();
  const isCurrentMonth = yearMonth === getCurrentYearMonth();
  return items.filter((item) => (!isCurrentMonth || item.day_of_month <= today.getDate()) && !hasMatchingTransaction(item, transactions)).map((item) => ({
    ...item,
    scheduledDate: `${yearMonth}-${String(item.day_of_month).padStart(2, '0')}`,
  }));
};

export const addMissingRecurringTransaction = async (id: string, yearMonth = getCurrentYearMonth(), actor?: AuditActor, actualAmount?: number) => {
  const item = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!item || !item.isActive || item.type !== 'expense') throw new Error('Recurring transaction is not available');
  const scheduledDate = `${yearMonth}-${String(item.day_of_month).padStart(2, '0')}`;
  const transactions = await prisma.transaction.findMany({
    where: { isVerified: true, isDeleted: false, date: { startsWith: yearMonth } },
    select: { vendor: true, type: true, date: true },
  });
  if (hasMatchingTransaction(item, transactions)) throw new Error('A matching transaction already exists');
  return prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({ data: {
      id: randomUUID(), date: scheduledDate, time: '', type: item.type, category: item.category, vendor: item.vendor,
      amount: actualAmount !== undefined ? Math.abs(actualAmount) : item.amount, currency: 'KRW', source: 'recurring_manual', memo: item.memo || '정기거래 미확인 항목 추가',
      member: item.member, isVerified: true, isDuplicate: false, isDeleted: false, isManualCategory: true, hash: randomUUID(),
    } });
    await tx.auditLog.create({ data: buildAuditLogData({ entityType: 'transaction', entityId: created.id, action: 'create', afterData: created, actor }) });
    return created;
  });
};

// Registered recurring items are planning records. Actual imports are matched in the UI/service; do not create duplicate transactions automatically.
export const processRecurringTransactions = async () => undefined;
