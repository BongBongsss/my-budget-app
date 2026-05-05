import React, { useState } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { PieChart, BarChart3 } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title, ChartDataLabels);

interface SummaryChartsProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  period: 'all' | 'month' | 'year';
}

const SummaryCharts: React.FC<SummaryChartsProps> = ({ transactions, categories, period }) => {
  const [incomeView, setIncomeView] = useState<'pie' | 'bar'>('pie');
  const [expenseView, setExpenseView] = useState<'pie' | 'bar'>('pie');
  const [activeHighlight, setActiveHighlight] = useState<{ type: 'income' | 'expense', group: string } | null>(null);

  const EXPENSE_PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
  const INCOME_PALETTE = ['#4ade80', '#38bdf8', '#818cf8', '#2dd4bf', '#a3e635', '#60a5fa'];

  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => { categoryToGroupMap[cat.name] = cat.groupName || '기타'; });

  const getGroupName = (categoryName: string) => {
    return categoryToGroupMap[categoryName] || categoryName.split('>')[0].trim() || '기타';
  };

  const getCurrentPeriodInfo = () => {
    if (transactions.length === 0) return "";
    const firstDate = transactions[0].date;
    if (period === 'month') return firstDate.substring(0, 7); 
    if (period === 'year') return firstDate.substring(0, 4); 
    return "All Time";
  };

  // 공통 데이터 처리 로직
  const getProcessedData = (type: 'income' | 'expense') => {
    const filtered = transactions.filter(t => t.type === type);
    const categoryData = filtered.reduce((acc: any, t: Transaction) => {
      const groupName = getGroupName(t.category);
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
      const groupName = getGroupName(t.category);
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
    } else {
      setActiveHighlight({ type, group });
    }
  };

  const renderLegend = (type: 'income' | 'expense', processed: any) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
      {processed.activeGroups.map((group: string) => (
        <div 
          key={group} 
          onClick={() => handleGroupClick(type, group)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', 
            backgroundColor: (activeHighlight?.type === type && activeHighlight?.group === group) ? '#f1f5f9' : 'transparent', 
            border: (activeHighlight?.type === type && activeHighlight?.group === group) ? '1px solid #3b82f6' : '1px solid transparent',
            transition: 'all 0.2s' 
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: processed.groupColorMap[group] }} />
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{group}</span>
          {activeHighlight?.type === type && activeHighlight?.group === group && (
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#3b82f6' }}>({processed.categoryData[group].toLocaleString()}원)</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '32px' }}>
      {/* 좌측: 수입 섹션 */}
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '550px', padding: '15px', position: 'relative', overflow: 'visible' }}>
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

        <div style={{ height: '420px', flex: 1, marginTop: '10px', position: 'relative', overflow: 'visible' }}>
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
                maintainAspectRatio: false, radius: '95%',
                layout: { padding: 45 },
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('income', incomeData.activeGroups[elements[0].index]);
                    else setActiveHighlight(null);
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
                    display: 'auto'
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
                    else setActiveHighlight(null);
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
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '550px', padding: '15px', position: 'relative', overflow: 'visible' }}>
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

        <div style={{ height: '420px', flex: 1, marginTop: '10px', position: 'relative', overflow: 'visible' }}>
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
                maintainAspectRatio: false, radius: '95%',
                layout: { padding: 45 },
                onClick: (evt, elements) => {
                    if (elements.length > 0) handleGroupClick('expense', expenseData.activeGroups[elements[0].index]);
                    else setActiveHighlight(null);
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
                    display: 'auto'
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
                    else setActiveHighlight(null);
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
