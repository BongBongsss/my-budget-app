import prisma from '../db';
import { randomUUID } from 'crypto';

export interface RuleCandidate {
  id: string;
  vendor: string;
  suggestedCategory: string;
  occurrenceCount: number;
}

/**
 * 사용자가 수동으로 수정한 데이터를 분석하여
 * 규칙화할 수 있는 후보들을 추출합니다.
 */
export const getRuleCandidates = async (minOccurrence: number = 3): Promise<RuleCandidate[]> => {
  // 1. 수정 이력이 있는 것으로 간주할 수 있는 데이터를 찾습니다.
  // 현재 모델에는 'isVerified' 플래그가 있는데, 
  // 수정된 데이터는 보통 자동 매칭된 '기타'에서 사용자가 바꾼 경우입니다.
  const allTransactions = await prisma.transaction.findMany({
    where: {
      NOT: { category: '기타' },
      isVerified: true
    }
  });

  // 2. 가맹점별로 카테고리 매핑 빈도를 계산
  const vendorCategoryMap: Record<string, Record<string, number>> = {};

  for (const tx of allTransactions) {
    if (!vendorCategoryMap[tx.vendor]) {
      vendorCategoryMap[tx.vendor] = {};
    }
    const cat = tx.category;
    vendorCategoryMap[tx.vendor][cat] = (vendorCategoryMap[tx.vendor][cat] || 0) + 1;
  }

  // 3. 기존 규칙 및 무시된 규칙에 없는지 확인 후 후보 추출
  const [existingRules, ignoredRules] = await Promise.all([
    prisma.categoryRule.findMany(),
    prisma.ignoredRule.findMany()
  ]);
  const candidates: RuleCandidate[] = [];
  const ignoredKeywords = new Set(ignoredRules.map(r => r.keyword));

  for (const [vendor, counts] of Object.entries(vendorCategoryMap)) {
    // 이미 규칙이 있는 경우 또는 무시된 경우 제외
    if (existingRules.find(r => r.keyword === vendor)) continue;
    if (ignoredKeywords.has(vendor)) continue;

    for (const [category, count] of Object.entries(counts)) {
      if (count >= minOccurrence) {
        candidates.push({
          id: randomUUID(),
          vendor,
          suggestedCategory: category,
          occurrenceCount: count
        });
      }
    }
  }

  return candidates;
};
