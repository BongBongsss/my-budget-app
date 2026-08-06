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
  it('uses an enlarged fixed chart area for readable desktop composition bars', () => {
    const { container } = render(
      <SummaryCharts
        transactions={[{ id: '1', date: '2026-02-01', type: 'income', category: '급여', vendor: '회사', amount: 100, source: 'manual' }]}
        trendTransactions={[{ id: '1', date: '2026-02-01', type: 'income', category: '급여', vendor: '회사', amount: 100, source: 'manual' }]}
        categories={[{ id: 'category-1', name: '급여', groupName: '급여' }]}
        period="month"
        onHighlight={vi.fn()}
      />,
    );

    const chartAreas = container.querySelectorAll('.summary-chart-area');
    expect(chartAreas).toHaveLength(2);
    chartAreas.forEach((area) => {
      expect((area as HTMLElement).style.height).toBe('540px');
      expect((area as HTMLElement).style.flex).toBe('0 0 540px');
    });
  });
});
