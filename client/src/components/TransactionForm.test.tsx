import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TransactionForm from './TransactionForm';

const addTransactionMock = vi.hoisted(() => vi.fn());

vi.mock('../api', () => ({
  addTransaction: addTransactionMock,
  autoCategorizeVendor: vi.fn(),
}));

describe('TransactionForm', () => {
  it('prevents a duplicate add while the first submission is still pending', async () => {
    const user = userEvent.setup();
    let finishRequest: () => void = () => undefined;
    addTransactionMock.mockImplementationOnce(() => new Promise<void>((resolve) => {
      finishRequest = resolve;
    }));
    const onSuccess = vi.fn();

    render(<TransactionForm onSuccess={onSuccess} categories={[{ id: 'food', name: 'Food' }]} />);

    const textInputs = document.querySelectorAll('input[type="text"]');
    await user.type(textInputs[1], 'Coffee shop');
    await user.type(document.querySelector('input[type="number"]')!, '5000');

    const submit = screen.getByRole('button', { name: '저장' });
    await user.click(submit);

    expect(addTransactionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '저장 중...' }));
    expect(addTransactionMock).toHaveBeenCalledTimes(1);

    finishRequest();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
