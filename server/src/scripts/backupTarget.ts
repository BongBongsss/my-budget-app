const expectedHost = /^ep-fancy-wind-aopgvcjv(?:-pooler)?\.c-2\.ap-southeast-1\.aws\.neon\.tech$/i;

export function requireProductionBackupUrl(value: string | undefined): string {
  let url: URL;
  try { url = new URL(value!); } catch { throw new Error('Invalid backup database configuration.'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !expectedHost.test(url.hostname)) {
    throw new Error('Backup target is not the confirmed production Neon endpoint.');
  }
  return value!;
}

export function hasProductionBackupSource(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const source = (value as { source?: { project?: string; branch?: string } }).source;
  return source?.project === 'autumn-brook-74570527' && source.branch === 'br-withered-credit-aoi7126o';
}
