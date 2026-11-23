const loopback = (host: string) => ['localhost', '127.0.0.1', '::1', '[::1]', '::ffff:127.0.0.1'].includes(host.toLowerCase());

export function localAccessEnabled(mode: string | undefined, flag: string | undefined, databaseUrl: string | undefined): boolean {
  if (mode === 'production' || flag !== 'true' || !databaseUrl) return false;
  try { return loopback(new URL(databaseUrl).hostname); } catch { return false; }
}

export function localAccessRequest(remoteAddress: string | undefined, host: string | undefined, forwarded: boolean): boolean {
  if (!remoteAddress || !loopback(remoteAddress) || !host || forwarded) return false;
  try { return loopback(new URL(`http://${host}`).hostname); } catch { return false; }
}
