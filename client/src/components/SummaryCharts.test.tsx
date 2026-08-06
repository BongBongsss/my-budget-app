import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SummaryCharts from './SummaryCharts';

vi.mock('react-chartjs-2', async () => {
  const React = await import('react');
  return {
    Pie: React.forwardRef<HTMLCanvasElement>((_props, ref) => <canvas ref={ref} data-testid="pie-chart" />),
    Bar: React.forwardRef<HTMLCanvasElement>((_props, ref) => <canvas ref={ref} data-testid="bar-chart" />),
  };
});

describe('SummaryCharts', () => {
  it('uses axis-free composition lists on desktop as well as mobile', () => {
    const { container } = render(
      <SummaryCharts
        transactions={[{ id: '1', date: '2026-02-01', type: 'income', category: '급여', vendor: '회사', amount: 100, source: 'manual' }]}
        trendTransactions={[{ id: '1', date: '2026-02-01', type: 'income', category: '급여', vendor: '회사', amount: 100, source: 'manual' }]}
        categories={[{ id: 'category-1', name: '급여', groupName: '급여' }]}
        period="month"
        onHighlight={vi.fn()}
      />,
    );

    const compositionLists = container.querySelectorAll('.summary-chart-area .mobile-comparison-list');
    expect(compositionLists).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid="bar-chart"]')).toHaveLength(0);
    expect(container.querySelectorAll('.mobile-comparison-bar')).toHaveLength(1);
  });
});
