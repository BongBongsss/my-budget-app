import prisma from '../db';
import { randomUUID } from 'crypto';
import { clearDeferredRuleSuggestion, getDeferredSuggestionKeys } from './suggestionDeferralService';
import { isRuleMatch, normalizeRuleText, UNCATEGORIZED_CATEGORIES } from './ruleMatching';

const MIN_OCCURRENCES = 3;
const MIN_CONFIDENCE = 0.8;

export interface RuleCandidate {
  id: string;
  vendor: string;
  suggestedCategory: string;
  occurrenceCount: number;
  totalOccurrences: number;
  confidence: number;
  lastUsedAt: string;
}

interface VendorHistory {
  vendor: string;
  categories: Map<string, number>;
  totalOccurrences: number;
  lastUsedAt: string;
}

const toOccurrenceTime = (date: string, time?: string | null) => `${date} ${time || '00:00'}`;

/**
 * Find conservative rule suggestions from confirmed history.
 * A merchant is suggested only when one active category accounts for >= 80% of
 * at least three confirmed transactions. Existing matching rules, ignored
 * merchants and deferred merchants are intentionally excluded.
 */
export const getRuleCandidates = async (): Promise<RuleCandidate[]> => {
  const [transactions, existingRules, ignoredRules, activeCategories, deferredKeys] = await Promise.all([
    prisma.transaction.findMany({
      where: { isVerified: true, isDeleted: false },
      select: { vendor: true, category: true, date: true, time: true },
    }),
    prisma.categoryRule.findMany(),
    prisma.ignoredRule.findMany(),
    prisma.category.findMany({ where: { isDeleted: false }, select: { name: true } }),
    getDeferredSuggestionKeys(),
  ]);

  const activeCategoryNames = new Set(activeCategories.map((category) => category.name));
  const ignoredKeys = new Set(ignoredRules.map((rule) => normalizeRuleText(rule.keyword)));
  const histories = new Map<string, VendorHistory>();

  for (const transaction of transactions) {
    const vendorKey = normalizeRuleText(transaction.vendor);
    if (!vendorKey || UNCATEGORIZED_CATEGORIES.has(transaction.category) || !activeCategoryNames.has(transaction.category)) {
      continue;
    }

    const occurredAt = toOccurrenceTime(transaction.date, transaction.time);
    const history = histories.get(vendorKey) || {
      vendor: transaction.vendor.trim(),
      categories: new Map<string, number>(),
      totalOccurrences: 0,
      lastUsedAt: occurredAt,
    };
    history.categories.set(transaction.category, (history.categories.get(transaction.category) || 0) + 1);
    history.totalOccurrences += 1;
    if (occurredAt > history.lastUsedAt) {
      history.lastUsedAt = occurredAt;
      history.vendor = transaction.vendor.trim();
    }
    histories.set(vendorKey, history);
  }

  const candidates: RuleCandidate[] = [];
  for (const [vendorKey, history] of histories) {
    if (ignoredKeys.has(vendorKey) || deferredKeys.has(vendorKey)) continue;
    if (existingRules.some((rule) => isRuleMatch(history.vendor, rule.keyword))) continue;

    const [suggestedCategory, occurrenceCount] = [...history.categories.entries()]
      .sort(([leftCategory, leftCount], [rightCategory, rightCount]) =>
        rightCount - leftCount || leftCategory.localeCompare(rightCategory),
      )[0];
    const confidence = occurrenceCount / history.totalOccurrences;

    if (occurrenceCount < MIN_OCCURRENCES || confidence < MIN_CONFIDENCE) continue;
    candidates.push({
      id: vendorKey,
      vendor: history.vendor,
      suggestedCategory,
      occurrenceCount,
      totalOccurrences: history.totalOccurrences,
      confidence: Math.round(confidence * 100),
      lastUsedAt: history.lastUsedAt,
    });
  }

  return candidates.sort((left, right) =>
    right.confidence - left.confidence ||
    right.occurrenceCount - left.occurrenceCount ||
    left.vendor.localeCompare(right.vendor),
  );
};

export const approveRuleCandidate = async (vendor: string, category: string) => {
  const vendorKey = normalizeRuleText(vendor);
  if (!vendorKey) throw new Error('Vendor is required');

  const activeCategory = await prisma.category.findFirst({
    where: { name: category, isDeleted: false },
    select: { name: true },
  });
  if (!activeCategory) throw new Error('Selected category is not available');

  const rule = await prisma.categoryRule.create({
    data: { id: randomUUID(), keyword: vendorKey, assigned_category: activeCategory.name },
  });
  await clearDeferredRuleSuggestion(vendorKey);
  return rule;
};
