import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const BrokenSection = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('render failure');
  return <p>정상 화면</p>;
};

describe('ErrorBoundary', () => {
  it('keeps the app usable by showing a retry fallback for a failed section', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = render(
      <ErrorBoundary title="차트를 불러오지 못했습니다.">
        <BrokenSection shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('차트를 불러오지 못했습니다.');

    view.rerender(
      <ErrorBoundary title="차트를 불러오지 못했습니다.">
        <BrokenSection shouldThrow={false} />
      </ErrorBoundary>
    );
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('정상 화면')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
