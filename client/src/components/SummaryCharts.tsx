import React, { useEffect, useState } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3 } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getGroupName } from '../utils/categoryUtils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title, ChartDataLabels);

interface SummaryChartsProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  period: 'all' | 'month' | 'year';
  onHighlight: (filter: { type: 'income' | 'expense', group: string } | null) => void;
}

const SummaryCharts: React.FC<SummaryChartsProps> = ({ transactions, categories, period, onHighlight }) => {
  const [incomeView, setIncomeView] = useState<'pie' | 'bar'>('pie');
  const [expenseView, setExpenseView] = useState<'pie' | 'bar'>('pie');
  const [activeHighlight, setActiveHighlight] = useState<{ type: 'income' | 'expense', group: string } | null>(null);
  const [isCompactMobile, setIsCompactMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateLayout = () => setIsCompactMobile(mediaQuery.matches);
    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);
    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  const EXPENSE_PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
  const INCOME_PALETTE = ['#4ade80', '#38bdf8', '#818cf8', '#2dd4bf', '#a3e635', '#60a5fa'];

  // 공통 데이터 처리 로직
  const getProcessedData = (type: 'income' | 'expense') => {
    const filtered = transactions.filter(t => t.type === type);
    const categoryData = filtered.reduce((acc: any, t: Transaction) => {
      const groupName = getGroupName(t.category, categories);
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {});

    const activeGroups = Object.keys(categoryData)
      .filter(group => categoryData[group] > 0)
      .sort((a, b) => categoryData[b] - categoryData[a]);

    const totalAmount = activeGroups.reduce((sum: number, group: string) => sum + categoryData[group], 0);

    const palette = type === 'income' ? INCOME_PALETTE : EXPENSE_PALETTE;
    const groupColorMap: Record<string, string> = {};
    activeGroups.forEach((group, idx) => { groupColorMap[group] = palette[idx % palette.length]; });

    return { filtered, categoryData, activeGroups, totalAmount, groupColorMap };
  };

  const incomeData = getProcessedData('income');
  const expenseData = getProcessedData('expense');

  const getBarData = (type: 'income' | 'expense', processed: any) => {
    const grouped = processed.filtered.reduce((acc: any, t: Transaction) => {
      let key;
      if (period === 'all') key = t.date.substring(0, 4);
      else if (period === 'year') key = t.date.substring(0, 7);
      else key = t.date;
      if (!acc[key]) acc[key] = {};
      const groupName = getGroupName(t.category, categories);
      acc[key][groupName] = (acc[key][groupName] || 0) + t.amount;
      return acc;
    }, {});

    const sortedKeys = Object.keys(grouped).sort();
    const labels = sortedKeys.map(key => {
        if (period === 'all') return key + '년';
        if (period === 'year') return key.substring(5, 7) + '월';
        return key.split('-')[2];
    });

    return {
      labels,
      originalKeys: sortedKeys,
      datasets: processed.activeGroups.map((group: string) => {
        const baseColor = processed.groupColorMap[group];
        const isSelected = activeHighlight?.type === type && activeHighlight?.group === group;
        const noSelection = !activeHighlight || activeHighlight.type !== type;
        
        return {
          label: group,
          backgroundColor: noSelection || isSelected ? baseColor : `${baseColor}33`,
          borderWidth: isSelected ? 1 : 0,
          borderColor: '#333',
          data: sortedKeys.map(key => grouped[key][group] || 0)
        };
      })
    };
  };

  const handleGroupClick = (type: 'income' | 'expense', group: string) => {
    if (activeHighlight?.type === type && activeHighlight?.group === group) {
      setActiveHighlight(null);
      onHighlight(null);
    } else {
      const newHighlight = { type, group };
      setActiveHighlight(newHighlight);
      onHighlight(newHighlight);
    }
  };

  const clearHighlight = () => {
    setActiveHighlight(null);
    onHighlight(null);
  };

  const renderLegend = (type: 'income' | 'expense', processed: any) => (
    <div className="summary-chart-legend" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
      {processed.activeGroups.map((group: string) => (
        <button
          type="button"
          key={group} 
          onClick={() => handleGroupClick(type, group)} 
          aria-pressed={activeHighlight?.type === type && activeHighlight?.group === group}
          title={`${group} 항목만 보기`}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '4px 7px', borderRadius: '4px',
            backgroundColor: (activeHighlight?.type === type && activeHighlight?.group === group) ? '#f1f5f9' : 'transparent', 
            border: (activeHighlight?.type === type && activeHighlight?.group === group) ? '1px solid #3b82f6' : '1px solid transparent',
            transition: 'all 0.2s', color: '#64748b'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: processed.groupColorMap[group] }} />
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{group}</span>
          {activeHighlight?.type === type && activeHighlight?.group === group && (
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#3b82f6' }}>({processed.categoryData[group].toLocaleString()}원)</span>
          )}
        </button>
      ))}
    </div>
  );

  const renderSplitHalf = (type: 'income' | 'expense', processed: any, direction: -1 | 1) => {
    const center = 160;
    const radius = 138;
    let angle = -Math.PI / 2;

    return processed.activeGroups.map((group: string) => {
      const value = processed.categoryData[group];
      const percentage = processed.totalAmount ? (value / processed.totalAmount) * 100 : 0;
      const arc = (percentage / 100) * Math.PI;
      const endAngle = angle + direction * arc;
      const startX = center + radius * Math.cos(angle);
      const startY = center + radius * Math.sin(angle);
      const endX = center + radius * Math.cos(endAngle);
      const endY = center + radius * Math.sin(endAngle);
      const labelAngle = angle + direction * arc / 2;
      const labelRadius = percentage < 6 ? 104 : 76;
      const labelX = center + labelRadius * Math.cos(labelAngle);
      const labelY = center + labelRadius * Math.sin(labelAngle);
      const isSelected = activeHighlight?.type === type && activeHighlight.group === group;
      const isDimmed = !!activeHighlight && !isSelected;
      const shortLabel = group.length > 6 ? `${group.slice(0, 5)}…` : group;

      angle = endAngle;

      return (
        <g key={`${type}-${group}`}>
          <path
            d={`M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 0 ${direction === 1 ? 1 : 0} ${endX} ${endY} Z`}
            fill={processed.groupColorMap[group]}
            fillOpacity={isDimmed ? 0.25 : 1}
            stroke="#fff"
            strokeWidth="1"
            style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
            onClick={(event) => {
              event.stopPropagation();
              handleGroupClick(type, group);
            }}
          >
            <title>{`${group}: ${percentage.toFixed(1)}% (${value.toLocaleString()}원)`}</title>
          </path>
          <text
            x={labelX}
            y={labelY - 3}
            textAnchor="middle"
            fontSize={percentage < 6 ? 6.5 : 8}
            fontWeight="700"
            fill="#0f172a"
            stroke="#fff"
            strokeWidth="2"
            paintOrder="stroke"
            pointerEvents="none"
          >
            <tspan x={labelX}>{shortLabel}</tspan>
            <tspan x={labelX} dy="9">{`${percentage.toFixed(1)}%`}</tspan>
          </text>
        </g>
      );
    });
  };

  if (isCompactMobile) {
    return (
      <div className="card-form mobile-split-chart-card" style={{ marginBottom: '32px' }}>
        <div className="mobile-split-chart-header">
          <div><span className="mobile-split-chart-dot income" />수입 구성</div>
          <div><span className="mobile-split-chart-dot expense" />지출 구성</div>
        </div>
        <p className="mobile-split-chart-guide">항목을 누르면 해당 거래만 조회합니다.</p>
        <svg
          className="mobile-split-chart"
          viewBox="0 0 320 320"
          role="img"
          aria-label="왼쪽은 수입 비중, 오른쪽은 지출 비중"
          onClick={clearHighlight}
        >
          {renderSplitHalf('income', incomeData, -1)}
          {renderSplitHalf('expense', expenseData, 1)}
          <line x1="160" y1="22" x2="160" y2="298" stroke="#fff" strokeWidth="2" pointerEvents="none" />
        </svg>
        <div className="mobile-split-chart-legends">
          <div>{renderLegend('income', incomeData)}</div>
          <div>{renderLegend('expense', expenseData)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 summary-charts" style={{ marginBottom: '32px' }}>
      {/* 좌측: 수입 섹션 */}
      <div className={`card-form summary-chart-card ${incomeView === 'pie' ? 'is-pie' : 'is-bar'}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '550px', padding: '15px', position: 'relative', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#10b981' }}>Income {incomeView === 'pie' ? 'Breakdown' : 'Trend'}</h3>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                    onClick={() => setIncomeView('pie')}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: incomeView === 'pie' ? '#dcfce7' : '#fff' }}
                    title="원형 차트"
                >
                    <PieChart size={16} color={incomeView === 'pie' ? '#10b981' : '#64748b'} />
                </button>
                <button 
                    onClick={() => setIncomeView('bar')}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: incomeView === 'bar' ? '#dcfce7' : '#fff' }}
                    title="막대 차트"
                >
                    <BarChart3 size={16} color={incomeView === 'bar' ? '#10b981' : '#64748b'} />
                </button>
            </div>
        </div>

        <div className="summary-chart-area" style={{ height: '420px', flex: '0 0 420px', marginTop: '10px', position: 'relative', overflow: 'visible' }}>
          {incomeView === 'pie' ? (
            <Pie 
              data={{
                labels: incomeData.activeGroups,
                datasets: [{
                  data: incomeData.activeGroups.map(group => incomeData.categoryData[group]),
                  backgroundColor: incomeData.activeGroups.map(group => incomeData.groupColorMap[group]),
                  borderWidth: 1, borderColor: '#fff'
                }]
              }} 
              options={{ 
                maintainAspectRatio: false, radius: isCompactMobile ? '90%' : '95%',
                layout: { padding: isCompactMobile ? 5 : 45 },
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('income', incomeData.activeGroups[elements[0].index]);
                    else clearHighlight();
                },
                plugins: {
                  legend: { display: false },
                  datalabels: {
                    formatter: (value: any, ctx: any) => {
                      const label = ctx.chart.data.labels?.[ctx.dataIndex];
                      const percentage = ((value / incomeData.totalAmount) * 100).toFixed(1);
                      return `${label}\n${percentage}%`;
                    },
                    color: '#000', font: { weight: 'bold', size: 12 }, textAlign: 'center',
                    textStrokeColor: '#fff', textStrokeWidth: 2,
                    anchor: 'end', align: 'start',
                    offset: (ctx: any) => ((ctx.dataset.data[ctx.dataIndex] as number / incomeData.totalAmount) * 100) >= 8 ? 30 : -45,
                    display: isCompactMobile ? false : 'auto'
                  }
                }
              }} 
            />
          ) : (
            <Bar 
              data={getBarData('income', incomeData)} 
              options={{ 
                maintainAspectRatio: false,
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('income', incomeData.activeGroups[elements[0].datasetIndex]);
                    else clearHighlight();
                },
                scales: { 
                  x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, 
                  y: { 
                      type: 'logarithmic', stacked: true, 
                      ticks: { font: { size: 10 }, callback: (val) => (val as number) >= 1000000 && (val as number) % 1000000 === 0 ? `${(val as number) / 1000000}M` : '' }
                  } 
                },
                plugins: { legend: { display: false }, datalabels: { display: false } }
              }} 
            />
          )}
        </div>
        {renderLegend('income', incomeData)}
      </div>

      {/* 우측: 지출 섹션 */}
      <div className={`card-form summary-chart-card ${expenseView === 'pie' ? 'is-pie' : 'is-bar'}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '550px', padding: '15px', position: 'relative', overflow: 'visible' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ef4444' }}>Expense {expenseView === 'pie' ? 'Breakdown' : 'Trend'}</h3>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                    onClick={() => setExpenseView('pie')}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: expenseView === 'pie' ? '#fee2e2' : '#fff' }}
                    title="원형 차트"
                >
                    <PieChart size={16} color={expenseView === 'pie' ? '#ef4444' : '#64748b'} />
                </button>
                <button 
                    onClick={() => setExpenseView('bar')}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: expenseView === 'bar' ? '#fee2e2' : '#fff' }}
                    title="막대 차트"
                >
                    <BarChart3 size={16} color={expenseView === 'bar' ? '#ef4444' : '#64748b'} />
                </button>
            </div>
        </div>

        <div className="summary-chart-area" style={{ height: '420px', flex: '0 0 420px', marginTop: '10px', position: 'relative', overflow: 'visible' }}>
          {expenseView === 'pie' ? (
            <Pie 
              data={{
                labels: expenseData.activeGroups,
                datasets: [{
                  data: expenseData.activeGroups.map(group => expenseData.categoryData[group]),
                  backgroundColor: expenseData.activeGroups.map(group => expenseData.groupColorMap[group]),
                  borderWidth: 1, borderColor: '#fff'
                }]
              }} 
              options={{ 
                maintainAspectRatio: false, radius: isCompactMobile ? '90%' : '95%',
                layout: { padding: isCompactMobile ? 5 : 45 },
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('expense', expenseData.activeGroups[elements[0].index]);
                    else clearHighlight();
                },
                plugins: {
                  legend: { display: false },
                  datalabels: {
                    formatter: (value: any, ctx: any) => {
                      const label = ctx.chart.data.labels?.[ctx.dataIndex];
                      const percentage = ((value / expenseData.totalAmount) * 100).toFixed(1);
                      return `${label}\n${percentage}%`;
                    },
                    color: '#000', font: { weight: 'bold', size: 12 }, textAlign: 'center',
                    textStrokeColor: '#fff', textStrokeWidth: 2,
                    anchor: 'end', align: 'start',
                    offset: (ctx: any) => ((ctx.dataset.data[ctx.dataIndex] as number / expenseData.totalAmount) * 100) >= 8 ? 30 : -45,
                    display: isCompactMobile ? false : 'auto'
                  }
                }
              }} 
            />
          ) : (
            <Bar 
              data={getBarData('expense', expenseData)} 
              options={{ 
                maintainAspectRatio: false,
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('expense', expenseData.activeGroups[elements[0].datasetIndex]);
                    else clearHighlight();
                },
                scales: { 
                  x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, 
                  y: { 
                      type: 'logarithmic', stacked: true, 
                      ticks: { font: { size: 10 }, callback: (val) => (val as number) >= 1000000 && (val as number) % 1000000 === 0 ? `${(val as number) / 1000000}M` : '' }
                  } 
                },
                plugins: { legend: { display: false }, datalabels: { display: false } }
              }} 
            />
          )}
        </div>
        {renderLegend('expense', expenseData)}
      </div>
    </div>
  );
};

export default SummaryCharts;
