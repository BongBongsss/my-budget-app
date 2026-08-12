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
const getLatestTransactionYearMonth = async () => {
  const latest = await prisma.transaction.findFirst({
    where: { isVerified: true, isDeleted: false, type: 'expense' },
    orderBy: { date: 'desc' },
    select: { date: true },
  });
  return latest ? getMonthKey(latest.date) : getCurrentYearMonth();
};
// Card statements often append a changing month/reference suffix (e.g. 새마을07-030, DB손해보험03406).
// Keep the stable merchant part for recurring-candidate grouping while leaving transaction data untouched.
export const getRecurringVendorLabel = (value: string) => {
  const normalized = value.replace(/\s+/g, ' ').trim();

  // A number-only description is the only available merchant identifier, not a suffix.
  if (/^\d+$/.test(normalized)) return normalized;

  return normalized
    .replace(/(?:\d{2}[-_]\d{3,}|[\s_-]+\d{3,}|\d{4,})$/, '')
    .trim();
};
const getRecurringVendorKey = (value: string) => normalizeRuleText(getRecurringVendorLabel(value));
export const getRecurringMatchScore = (item: { vendor: string; amount: number; category: string; member: string; day_of_month: number; isVariable: boolean }, transaction: { vendor: string; amount: number; category: string; member: string; date: string }) => {
  if (item.member !== transaction.member) return { score: 0, reasons: [] };
  const itemVendor = getRecurringVendorKey(item.vendor);
  const transactionVendor = getRecurringVendorKey(transaction.vendor);
  const vendor = itemVendor === transactionVendor ? 35 : (itemVendor.includes(transactionVendor) || transactionVendor.includes(itemVendor)) ? 25 : 0;
  const dayDifference = Math.abs(getDay(transaction.date) - item.day_of_month);
  const scheduledDay = dayDifference <= 2 ? 15 : dayDifference <= 5 ? 10 : dayDifference <= 8 ? 4 : 0;
  const amountDifference = Math.abs(item.amount - transaction.amount) / Math.max(item.amount, 1);
  const allowedDifference = item.isVariable ? 0.2 : 0.1;
  const amount = amountDifference <= 0.03 ? 20 : amountDifference <= allowedDifference ? 14 : amountDifference <= allowedDifference * 2 ? 6 : 0;
  const member = 10;
  const category = item.category === transaction.category ? 10 : 0;
  const reasons = [vendor === 35 ? '거래처 일치' : vendor ? '거래처 유사' : null, scheduledDay >= 10 ? '결제일 일치' : scheduledDay ? '결제일 근접' : null, amount >= 14 ? '금액 일치' : amount ? '금액 범위 내' : null, member === 10 ? '구성원 일치' : null, category ? '카테고리 일치' : null].filter(Boolean) as string[];
  return { score: vendor + scheduledDay + amount + member + category, reasons };
};
const hasMatchingTransaction = (item: { vendor: string; type: string; day_of_month: number }, transactions: Array<{ vendor: string; type: string; date: string }>) => {
  const itemVendor = normalizeRuleText(item.vendor);
  return transactions.some((transaction) => transaction.type === item.type && Math.abs(getDay(transaction.date) - item.day_of_month) <= 5 && (
    normalizeRuleText(transaction.vendor).includes(itemVendor) || itemVendor.includes(normalizeRuleText(transaction.vendor))
  ));
};

export const getAllRecurringTransactions = async () => {
  const yearMonth = await getLatestTransactionYearMonth();
  const [items, transactions] = await Promise.all([
    prisma.recurringTransaction.findMany({ where: { type: 'expense' }, orderBy: [{ isActive: 'desc' }, { day_of_month: 'asc' }, { vendor: 'asc' }] }),
    prisma.transaction.findMany({ where: { isVerified: true, isDeleted: false, type: 'expense', date: { startsWith: yearMonth } }, select: { vendor: true, amount: true, category: true, member: true, date: true } }),
  ]);
  return items.map((item) => {
    const matches = transactions.map((transaction) => ({ ...getRecurringMatchScore(item, transaction) })).sort((a, b) => b.score - a.score);
    const best = matches[0];
    const likelyMatches = matches.filter((match) => match.score >= 60).length;
    const matchStatus = !item.isActive ? 'inactive' : !best || best.score < 60 ? 'missing' : likelyMatches > 1 ? 'duplicate_suspected' : best.score >= 90 ? 'auto_matched' : 'review_required';
    return { ...item, matchStatus, matchScore: best?.score || 0, matchReasons: best?.reasons || [], matchYearMonth: yearMonth };
  });
};

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
  const excluded = new Set([...existing.map((item) => getRecurringVendorKey(item.vendor)), ...ignored.map((item) => item.vendorKey), ...deferred.map((item) => item.vendorKey)]);
  const groups = new Map<string, typeof transactions>();
  transactions.forEach((transaction) => {
    const vendorKey = getRecurringVendorKey(transaction.vendor);
    const key = `${vendorKey}|${transaction.type}|${transaction.member}`;
    if (!vendorKey) return;
    const list = groups.get(key) || [];
    list.push(transaction);
    groups.set(key, list);
  });
  return [...groups.values()].flatMap((list) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const vendorKey = getRecurringVendorKey(sorted[0].vendor);
    if (excluded.has(vendorKey)) return [];
    const months = new Set(sorted.map((item) => getMonthKey(item.date)));
    const days = sorted.map((item) => getDay(item.date));
    if (months.size < 3 || !sameScheduledDay(days)) return [];
    const amount = sorted.reduce((sum, item) => sum + item.amount, 0) / sorted.length;
    const maxDifference = Math.max(...sorted.map((item) => Math.abs(item.amount - amount)));
    const categoryCounts = new Map<string, number>();
    sorted.forEach((item) => categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1));
    const category = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const amountVariation = Math.round((maxDifference / Math.max(amount, 1)) * 100);
    const confidence = Math.min(100, Math.min(30, months.size * 5) + 15 + Math.max(0, 15 - Math.round(amountVariation / 2)) + (categoryCounts.size === 1 ? 10 : 5) + 20);
    return [{
      id: vendorKey, vendor: getRecurringVendorLabel(sorted[sorted.length - 1].vendor), type: sorted[0].type, member: sorted[0].member,
      category, occurrenceCount: sorted.length, monthCount: months.size,
      averageAmount: Math.round(amount), minAmount: Math.min(...sorted.map((item) => item.amount)), maxAmount: Math.max(...sorted.map((item) => item.amount)),
      dayOfMonth: Math.round(days.reduce((sum, day) => sum + day, 0) / days.length),
      isVariable: maxDifference > amount * 0.15, lastUsedAt: sorted[sorted.length - 1].date,
      confidence, reasons: [`최근 ${months.size}개월 반복`, '결제일 일정', `금액 ${amountVariation}% 변동`],
    }];
  }).sort((a, b) => b.monthCount - a.monthCount || b.occurrenceCount - a.occurrenceCount);
};

export const deferRecurringCandidate = async (vendor: string) => {
  const vendorKey = getRecurringVendorKey(vendor);
  const deferredUntil = new Date(); deferredUntil.setDate(deferredUntil.getDate() + DEFER_DAYS);
  return prisma.deferredRecurringSuggestion.upsert({ where: { vendorKey }, update: { deferredUntil }, create: { id: randomUUID(), vendorKey, deferredUntil } });
};

export const ignoreRecurringCandidate = async (vendor: string) => {
  const vendorKey = getRecurringVendorKey(vendor);
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
