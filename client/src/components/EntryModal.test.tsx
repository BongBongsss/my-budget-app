import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EntryModal from './EntryModal';

describe('EntryModal', () => {
  it('closes from its explicit close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EntryModal title="거래 입력" onClose={onClose}><p>입력 내용</p></EntryModal>);

    await user.click(screen.getByRole('button', { name: '거래 입력 닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when interacting with the form content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<EntryModal title="자산 등록" onClose={onClose}><button type="button">등록</button></EntryModal>);

    await user.click(screen.getByRole('button', { name: '등록' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
