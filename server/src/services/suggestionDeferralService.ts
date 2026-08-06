import prisma from '../db';
import { normalizeRuleText } from './ruleMatching';

const DEFER_DAYS = 30;

export const getDeferredSuggestionKeys = async (): Promise<Set<string>> => {
  const deferred = await prisma.deferredRuleSuggestion.findMany({
    where: { deferredUntil: { gt: new Date() } },
    select: { vendorKey: true },
  });
  return new Set(deferred.map((item) => item.vendorKey));
};

export const deferRuleSuggestion = async (vendor: string) => {
  const vendorKey = normalizeRuleText(vendor);
  if (!vendorKey) throw new Error('Vendor is required');
  const deferredUntil = new Date();
  deferredUntil.setDate(deferredUntil.getDate() + DEFER_DAYS);

  return prisma.deferredRuleSuggestion.upsert({
    where: { vendorKey },
    update: { deferredUntil },
    create: { vendorKey, deferredUntil },
  });
};

export const clearDeferredRuleSuggestion = async (vendor: string) => {
  const vendorKey = normalizeRuleText(vendor);
  if (!vendorKey) return;
  await prisma.deferredRuleSuggestion.deleteMany({ where: { vendorKey } });
};
