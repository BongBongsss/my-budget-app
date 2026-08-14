import { describe, expect, it } from 'vitest';
import { createMutationGuard, createMutationKey, MutationInFlightRegistry } from './mutationGuard';
import { EventEmitter } from 'events';
import { ConflictError } from '../utils/errors';

describe('mutation request guard', () => {
  it('treats the same write request as one in-flight operation', () => {
    const registry = new MutationInFlightRegistry();
    const key = createMutationKey('session-1', 'post', '/api/assets', { name: '생활비', balance: 10000 });

    expect(registry.tryStart(key)).toBe(true);
    expect(registry.tryStart(key)).toBe(false);
    registry.finish(key);
    expect(registry.tryStart(key)).toBe(true);
  });

  it('keeps different values and sessions independent', () => {
    const registry = new MutationInFlightRegistry();
    const first = createMutationKey('session-1', 'post', '/api/assets', { balance: 10000, name: '생활비' });
    const reordered = createMutationKey('session-1', 'post', '/api/assets', { name: '생활비', balance: 10000 });
    const differentSession = createMutationKey('session-2', 'post', '/api/assets', { name: '생활비', balance: 10000 });

    expect(first).toBe(reordered);
    expect(registry.tryStart(first)).toBe(true);
    expect(registry.tryStart(differentSession)).toBe(true);
  });

  it('rejects only a concurrent duplicate and releases the lock after completion', () => {
    const registry = new MutationInFlightRegistry();
    const guard = createMutationGuard(registry);
    const response = new EventEmitter() as any;
    const request = { method: 'POST', originalUrl: '/api/assets', body: { name: '생활비' }, sessionID: 'session-1' } as any;
    const firstNext = (error?: unknown) => expect(error).toBeUndefined();
    let secondError: unknown;

    guard(request, response, firstNext);
    guard(request, response, (error?: unknown) => { secondError = error; });
    expect(secondError).toBeInstanceOf(ConflictError);
    response.emit('finish');
    guard(request, response, firstNext);
  });
});
