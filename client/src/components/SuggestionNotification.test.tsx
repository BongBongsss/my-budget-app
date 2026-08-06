import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SuggestionNotification from './SuggestionNotification';

const getRuleSuggestionsMock = vi.hoisted(() => vi.fn());
const approveRuleSuggestionMock = vi.hoisted(() => vi.fn());
const deferRuleSuggestionMock = vi.hoisted(() => vi.fn());
const ignoreRuleSuggestionMock = vi.hoisted(() => vi.fn());

vi.mock('../api', () => ({
  getRuleSuggestions: getRuleSuggestionsMock,
  approveRuleSuggestion: approveRuleSuggestionMock,
  deferRuleSuggestion: deferRuleSuggestionMock,
  ignoreRuleSuggestion: ignoreRuleSuggestionMock,
}));

const suggestion = {
  id: 'test-store',
  vendor: '테스트 상점',
  suggestedCategory: '식비',
  occurrenceCount: 4,
  totalOccurrences: 5,
  confidence: 80,
  lastUsedAt: '2026-08-05 09:00',
};

describe('SuggestionNotification', () => {
  it('shows the evidence for a conservative rule suggestion', async () => {
    getRuleSuggestionsMock.mockResolvedValue({ data: [suggestion] });

    render(<SuggestionNotification onRuleApproved={vi.fn()} />);

    expect(await screen.findByText('자동분류 규칙 추천')).toBeInTheDocument();
    expect(screen.getByText(/5건 중 4건 일치 \(80%\)/)).toBeInTheDocument();
  });

  it('defers a recommendation for 30 days without registering a rule', async () => {
    const user = userEvent.setup();
    getRuleSuggestionsMock.mockResolvedValue({ data: [suggestion] });
    deferRuleSuggestionMock.mockResolvedValue({ data: { success: true } });

    render(<SuggestionNotification onRuleApproved={vi.fn()} />);
    await user.click(await screen.findByRole('button', { name: '30일 보류' }));

    await waitFor(() => expect(deferRuleSuggestionMock).toHaveBeenCalledWith('테스트 상점'));
    expect(approveRuleSuggestionMock).not.toHaveBeenCalled();
    expect(screen.queryByText('자동분류 규칙 추천')).not.toBeInTheDocument();
  });
});
