import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PeriodMemberFilter from './PeriodMemberFilter';

const renderFilter = () => {
  const props = {
    period: 'all' as const,
    setPeriod: vi.fn(),
    year: 2026,
    setYear: vi.fn(),
    month: 8,
    setMonth: vi.fn(),
    memberFilter: 'all' as const,
    setMemberFilter: vi.fn(),
  };

  render(<PeriodMemberFilter {...props} />);
  return props;
};

describe('PeriodMemberFilter', () => {
  it('reports period changes through the shared callback', async () => {
    const user = userEvent.setup();
    const props = renderFilter();

    await user.selectOptions(screen.getByLabelText('기간 선택'), 'month');

    expect(props.setPeriod).toHaveBeenCalledWith('month');
  });

  it('reports member filter changes through the shared callback', async () => {
    const user = userEvent.setup();
    const props = renderFilter();

    await user.click(screen.getByRole('button', { name: '미지정' }));

    expect(props.setMemberFilter).toHaveBeenCalledWith('미지정');
  });
});
