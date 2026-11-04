import { describe, expect, it, vi } from 'vitest';

const deleteMock = vi.hoisted(() => vi.fn());
const requestInterceptorUseMock = vi.hoisted(() => vi.fn());
const responseInterceptorUseMock = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: () => ({
      delete: deleteMock,
      interceptors: {
        request: { use: requestInterceptorUseMock },
        response: { use: responseInterceptorUseMock },
      },
    }),
    CanceledError: class CanceledError extends Error {},
  },
}));

import { deleteCategory, mutationRequestKey, onSessionExpired, resetApiSession } from './api';

describe('category API contract', () => {
  it('sends a category ID in the DELETE request body', async () => {
    deleteMock.mockResolvedValue({ data: { success: true } });

    await deleteCategory('category-123');

    expect(deleteMock).toHaveBeenCalledWith('/categories', {
      data: { id: 'category-123' },
    });
  });

  it('blocks an identical mutation while the first request is in progress', async () => {
    const requestHandler = requestInterceptorUseMock.mock.calls[0][0];
    const responseHandler = responseInterceptorUseMock.mock.calls[0][0];
    const first = { method: 'post', url: '/assets', data: { name: '생활비', balance: 10000 } };

    const accepted = await requestHandler(first);
    await expect(requestHandler({ ...first, data: { balance: 10000, name: '생활비' } })).rejects.toMatchObject({ isDuplicateMutation: true });

    responseHandler({ config: accepted });
    expect(requestHandler({ ...first })).toMatchObject({ __mutationKey: expect.any(String) });
  });

  it('creates the same key even when object property order differs', () => {
    expect(mutationRequestKey({ method: 'post', url: '/assets', data: { name: '생활비', balance: 10000 } }))
      .toBe(mutationRequestKey({ method: 'post', url: '/assets', data: { balance: 10000, name: '생활비' } }));
  });
});

describe('session expiry handling', () => {
  const rejectResponse = (status: number, url: string, message = 'Unauthorized', generation?: number) => {
    const handler = responseInterceptorUseMock.mock.calls[0][1];
    return handler({
      config: { url, ...(generation === undefined ? {} : { __sessionGeneration: generation }) },
      response: { status, data: { message, code: 'UNAUTHORIZED' } },
    });
  };

  it('notifies once for simultaneous expired requests and preserves error status compatibility', async () => {
    resetApiSession();
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);
    try {
      await expect(rejectResponse(401, '/transactions')).rejects.toMatchObject({
        status: 401, response: { status: 401 },
      });
      await expect(rejectResponse(401, '/assets')).rejects.toMatchObject({ status: 401 });
      expect(listener).toHaveBeenCalledTimes(1);
    } finally { unsubscribe(); }
  });

  it('does not expire sessions for bad credentials, wrong passwords, forbidden actions or network errors', async () => {
    resetApiSession();
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);
    try {
      for (const [status, url, message] of [
        [401, '/login', 'Invalid ID or Password'],
        [401, '/change-password', 'Wrong current password'],
        [401, '/transactions/export', 'Admin role required'],
        [403, '/assets', 'Forbidden'],
      ] as const) {
        await expect(rejectResponse(status, url, message)).rejects.toBeInstanceOf(Error);
      }
      const error = new Error('Network error');
      await expect(responseInterceptorUseMock.mock.calls[0][1](error)).rejects.toBe(error);
      expect(listener).not.toHaveBeenCalled();
    } finally { unsubscribe(); }
  });

  it('ignores late failures from the previous login and allows notification in the new session', async () => {
    resetApiSession();
    const request = requestInterceptorUseMock.mock.calls[0][0]({ method: 'get', url: '/transactions' });
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);
    try {
      responseInterceptorUseMock.mock.calls[0][0]({ config: { url: '/login' } });
      await expect(rejectResponse(401, '/transactions', 'Unauthorized', request.__sessionGeneration)).rejects.toBeInstanceOf(Error);
      expect(listener).not.toHaveBeenCalled();
      await expect(rejectResponse(401, '/transactions')).rejects.toBeInstanceOf(Error);
      expect(listener).toHaveBeenCalledTimes(1);
    } finally { unsubscribe(); }
  });
});
