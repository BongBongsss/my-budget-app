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

import { deleteCategory, mutationRequestKey } from './api';

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
