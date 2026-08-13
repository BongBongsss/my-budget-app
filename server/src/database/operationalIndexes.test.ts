import { describe, expect, it, vi } from 'vitest';
import { ensureOperationalIndexes } from './operationalIndexes';

describe('ensureOperationalIndexes', () => {
  it('creates the active verified transaction date index idempotently', async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    await ensureOperationalIndexes({ $executeRawUnsafe: execute } as any);
    expect(execute).toHaveBeenCalledWith(expect.stringContaining('Transaction_active_verified_date_idx'));
    expect(execute).toHaveBeenCalledWith(expect.stringContaining('"isDeleted" = false AND "isVerified" = true'));
  });
});
