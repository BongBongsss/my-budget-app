import { describe, expect, it } from 'vitest';
import { localAccessEnabled, localAccessRequest } from './localAccess';

describe('local automatic access', () => {
  it('requires an explicit flag, non-production mode, and loopback database', () => {
    expect(localAccessEnabled('development', 'true', 'postgresql://u:p@localhost/db')).toBe(true);
    expect(localAccessEnabled('production', 'true', 'postgresql://u:p@localhost/db')).toBe(false);
    expect(localAccessEnabled('development', undefined, 'postgresql://u:p@localhost/db')).toBe(false);
    expect(localAccessEnabled('development', 'true', 'postgresql://u:p@example.com/db')).toBe(false);
    expect(localAccessEnabled('development', 'true', 'invalid')).toBe(false);
  });
  it('accepts only direct loopback requests with a loopback host', () => {
    expect(localAccessRequest('127.0.0.1', '127.0.0.1:5000', false)).toBe(true);
    expect(localAccessRequest('192.168.1.2', '127.0.0.1:5000', false)).toBe(false);
    expect(localAccessRequest('127.0.0.1', 'example.com', false)).toBe(false);
    expect(localAccessRequest('127.0.0.1', 'localhost:5000', true)).toBe(false);
  });
});
