import { describe, expect, it, vi } from 'vitest';

const deleteMock = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: () => ({
      delete: deleteMock,
      interceptors: {
        response: { use: vi.fn() },
      },
    }),
  },
}));

import { deleteCategory } from './api';

describe('category API contract', () => {
  it('sends a category ID in the DELETE request body', async () => {
    deleteMock.mockResolvedValue({ data: { success: true } });

    await deleteCategory('category-123');

    expect(deleteMock).toHaveBeenCalledWith('/categories', {
      data: { id: 'category-123' },
    });
  });
});
