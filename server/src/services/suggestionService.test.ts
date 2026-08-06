import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db', () => ({
  default: {
    transaction: { findMany: vi.fn() },
    categoryRule: { findMany: vi.fn(), create: vi.fn() },
    ignoredRule: { findMany: vi.fn() },
    category: { findMany: vi.fn(), findFirst: vi.fn() },
    deferredRuleSuggestion: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  },
}));

import prisma from '../db';
import { getRuleCandidates } from './suggestionService';

const activeCategories = [{ name: '식비' }, { name: '쇼핑' }];

describe('suggestionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.category.findMany as any).mockResolvedValue(activeCategories);
    (prisma.categoryRule.findMany as any).mockResolvedValue([]);
    (prisma.ignoredRule.findMany as any).mockResolvedValue([]);
    (prisma.deferredRuleSuggestion.findMany as any).mockResolvedValue([]);
  });

  it('suggests only the dominant category with confidence evidence', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([
      { vendor: '테스트 상점', category: '식비', date: '2026-08-01', time: '10:00' },
      { vendor: '테스트 상점', category: '식비', date: '2026-08-02', time: '10:00' },
      { vendor: '테스트 상점', category: '식비', date: '2026-08-03', time: '10:00' },
      { vendor: '테스트 상점', category: '식비', date: '2026-08-04', time: '10:00' },
      { vendor: '테스트 상점', category: '쇼핑', date: '2026-08-05', time: '10:00' },
    ]);

    await expect(getRuleCandidates()).resolves.toEqual([
      expect.objectContaining({
        vendor: '테스트 상점',
        suggestedCategory: '식비',
        occurrenceCount: 4,
        totalOccurrences: 5,
        confidence: 80,
        lastUsedAt: '2026-08-05 10:00',
      }),
    ]);
  });

  it('does not suggest ambiguous merchant history', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([
      { vendor: '혼합 상점', category: '식비', date: '2026-08-01' },
      { vendor: '혼합 상점', category: '식비', date: '2026-08-02' },
      { vendor: '혼합 상점', category: '식비', date: '2026-08-03' },
      { vendor: '혼합 상점', category: '쇼핑', date: '2026-08-04' },
      { vendor: '혼합 상점', category: '쇼핑', date: '2026-08-05' },
    ]);

    await expect(getRuleCandidates()).resolves.toEqual([]);
  });

  it('excludes merchants already covered by a broader existing rule', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([
      { vendor: '카카오페이 결제', category: '식비', date: '2026-08-01' },
      { vendor: '카카오페이 결제', category: '식비', date: '2026-08-02' },
      { vendor: '카카오페이 결제', category: '식비', date: '2026-08-03' },
    ]);
    (prisma.categoryRule.findMany as any).mockResolvedValue([{ keyword: '카카오', assigned_category: '기타' }]);

    await expect(getRuleCandidates()).resolves.toEqual([]);
  });

  it('excludes categories that have been deleted', async () => {
    (prisma.transaction.findMany as any).mockResolvedValue([
      { vendor: '과거 상점', category: '삭제된 분류', date: '2026-08-01' },
      { vendor: '과거 상점', category: '삭제된 분류', date: '2026-08-02' },
      { vendor: '과거 상점', category: '삭제된 분류', date: '2026-08-03' },
    ]);

    await expect(getRuleCandidates()).resolves.toEqual([]);
  });
});
