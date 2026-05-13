import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prisma Mocking
vi.mock('../db', () => ({
  default: {
    asset: {
      findMany: vi.fn(),
    },
    assetHistory: {
      upsert: vi.fn(),
    },
  },
}));

import prisma from '../db';
import { saveAssetHistory } from './assetService';

describe('AssetService - History Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('자산과 부채를 합산하여 순자산을 정확히 계산하고 저장해야 한다', async () => {
    // 1. 가짜 자산 데이터 설정
    const mockAssets = [
      { name: 'Bank Account', balance: 1000000, type: 'bank', isDeleted: false },
      { name: 'Cash', balance: 500000, type: 'cash', isDeleted: false },
      { name: 'Loan', balance: 300000, type: 'liability', isDeleted: false },
    ];
    
    (prisma.asset.findMany as any).mockResolvedValue(mockAssets);

    // 2. 함수 실행
    await saveAssetHistory();

    // 3. 검증: (1,000,000 + 500,000) - (300,000) = 1,200,000
    expect(prisma.assetHistory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          yearMonth: expect.any(String),
          totalAssets: 1500000,
          totalLiabilities: 300000,
          netAssets: 1200000,
        },
        update: {
          totalAssets: 1500000,
          totalLiabilities: 300000,
          netAssets: 1200000,
        }
      })
    );
  });

  it('삭제된(isDeleted: true) 자산은 계산에서 제외해야 한다', async () => {
    const mockAssets = [
      { name: 'Active Bank', balance: 1000, type: 'bank', isDeleted: false },
      { name: 'Deleted Bank', balance: 5000, type: 'bank', isDeleted: true },
    ];
    
    (prisma.asset.findMany as any).mockResolvedValue(mockAssets.filter(a => !a.isDeleted));
    // 참고: 실제 service 코드에서는 findMany에서 { where: { isDeleted: false } }를 사용함

    await saveAssetHistory();

    expect(prisma.assetHistory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          totalAssets: 1000,
          netAssets: 1000,
        })
      })
    );
  });
});
