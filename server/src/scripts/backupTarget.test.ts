import { describe, expect, it } from 'vitest';
import { hasProductionBackupSource, requireProductionBackupUrl } from './backupTarget';

describe('production backup target', () => {
  it('accepts the confirmed Neon endpoint, including its pooled hostname', () => {
    for (const host of ['ep-fancy-wind-aopgvcjv', 'ep-fancy-wind-aopgvcjv-pooler']) {
      const url = `postgresql://user:password@${host}.c-2.ap-southeast-1.aws.neon.tech/db`;
      expect(requireProductionBackupUrl(url)).toBe(url);
    }
  });
  it('rejects missing, local, mismatched, and deceptive hosts', () => {
    for (const url of [undefined, 'postgresql://localhost/budget_dev', 'postgresql://other.neon.tech/db', 'postgresql://ep-fancy-wind-aopgvcjv.c-2.ap-southeast-1.aws.neon.tech.evil.example/db', 'https://ep-fancy-wind-aopgvcjv.c-2.ap-southeast-1.aws.neon.tech/db']) {
      expect(() => requireProductionBackupUrl(url)).toThrow();
    }
  });
  it('requires both production project and branch markers', () => {
    expect(hasProductionBackupSource({ source: { project: 'autumn-brook-74570527', branch: 'br-withered-credit-aoi7126o' } })).toBe(true);
    expect(hasProductionBackupSource({ source: { project: 'autumn-brook-74570527', branch: 'other' } })).toBe(false);
    expect(hasProductionBackupSource({})).toBe(false);
  });
});
