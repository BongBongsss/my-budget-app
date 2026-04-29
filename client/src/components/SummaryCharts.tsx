import React, { useState, useRef } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title, ChartDataLabels);

interface SummaryChartsProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  period: 'all' | 'month' | 'year';
}

const SummaryCharts: React.FC<SummaryChartsProps> = ({ transactions, categories, period }) => {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const pieRef = useRef<any>(null);
  const barRef = useRef<any>(null);

  const EXPENSE_PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
  const INCOME_PALETTE = ['#4ade80', '#38bdf8', '#818cf8', '#2dd4bf', '#a3e635', '#60a5fa'];
  
  const COLOR_PALETTE = chartType === 'expense' ? EXPENSE_PALETTE : INCOME_PALETTE;

  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryToGroupMap[cat.name] = cat.groupName || '기타';
  });

  const getGroupName = (categoryName: string) => {
    return categoryToGroupMap[categoryName] || categoryName.split('>')[0].trim() || '기타';
  };

  const filteredData = transactions.filter(t => t.type === chartType);
  
  const categoryData = filteredData.reduce((acc: any, t) => {
      const groupName = getGroupName(t.category);
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {});

  const activeGroups = Object.keys(categoryData)
    .filter(group => categoryData[group] > 0)
    .sort((a, b) => categoryData[b] - categoryData[a]);

  const totalAmount = activeGroups.reduce((sum, group) => sum + categoryData[group], 0);

  const groupColorMap: Record<string, string> = {};
  activeGroups.forEach((group, idx) => {
    groupColorMap[group] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
  });

  const getCurrentPeriodInfo = () => {
    if (transactions.length === 0) return "";
    const firstDate = transactions[0].date;
    if (period === 'month') return firstDate.substring(0, 7); 
    if (period === 'year') return firstDate.substring(0, 4); 
    return "All Time";
  };

  const handleLegendHover = (group: string | null) => {
    setHoveredGroup(group);
    const index = group ? activeGroups.indexOf(group) : -1;
    if (pieRef.current && index >= 0) pieRef.current.setActiveElements([{ datasetIndex: 0, index }]);
    else if (pieRef.current) pieRef.current.setActiveElements([]);
    if (barRef.current) barRef.current.update();
  };

  const CustomLegend = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
      {activeGroups.map((group) => (
        <div key={group} onMouseEnter={() => handleLegendHover(group)} onMouseLeave={() => handleLegendHover(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: hoveredGroup === group ? '#f1f5f9' : 'transparent', transition: 'all 0.1s' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: groupColorMap[group] }} />
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{group}</span>
          {hoveredGroup === group && <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#3b82f6' }}>({categoryData[group].toLocaleString()}원)</span>}
        </div>
      ))}
    </div>
  );

  const getBarData = () => {
    const grouped = filteredData.reduce((acc: any, t) => {
      let key;
      if (period === 'all') key = t.date.substring(0, 4);
      else if (period === 'year') key = t.date.substring(0, 7);
      else key = t.date;
      
      const groupName = getGroupName(t.category);
      if (!acc[key]) acc[key] = {};
      acc[key][groupName] = (acc[key][groupName] || 0) + t.amount;
      return acc;
    }, {});

    const sortedKeys = Object.keys(grouped).sort();
    
    const labels = sortedKeys.map(key => {
      if (period === 'all') return key + '년';
      if (period === 'year') return key.substring(5, 7) + '월';
      return key.split('-')[2];
    });
    
    const datasets = activeGroups.map((group) => ({
      label: group,
      data: sortedKeys.map(key => grouped[key][group] || 0),
      backgroundColor: groupColorMap[group],
      borderWidth: hoveredGroup === group ? 2 : 0,
      borderColor: '#333'
    }));

    return { labels, datasets, originalKeys: sortedKeys };
  };

  const barDataObj = getBarData();

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <button onClick={() => setChartType('expense')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'expense' ? '#fee2e2' : '#f1f5f9', color: chartType === 'expense' ? '#ef4444' : '#64748b', fontWeight: chartType === 'expense' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
          <ArrowDownCircle size={18} /> 지출 분석
        </button>
        <button onClick={() => setChartType('income')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'income' ? '#dcfce7' : '#f1f5f9', color: chartType === 'income' ? '#10b981' : '#64748b', fontWeight: chartType === 'income' ? 'bold' : 'normal', transition: 'all 0.2s' }}>
          <ArrowUpCircle size={18} /> 수입 분석
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <h3>{chartType === 'expense' ? 'Expense' : 'Income'} Breakdown</h3>
          <div style={{ height: '320px', flex: 1 }}>
            <Pie 
              ref={pieRef}
              data={{
                labels: activeGroups,
                datasets: [{
                  data: activeGroups.map(group => categoryData[group]),
                  backgroundColor: activeGroups.map(group => groupColorMap[group]),
                }]
              }} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                  datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    formatter: (value, ctx) => {
                      const label = ctx.chart.data.labels?.[ctx.dataIndex];
                      const percentage = ((value / totalAmount) * 100).toFixed(1);
                      // 비중이 5% 이상인 경우에만 텍스트 표시 (가독성 위해)
                      return parseFloat(percentage) > 5 ? `${label}\n${percentage}%` : '';
                    },
                    textAlign: 'center',
                    display: 'auto'
                  }
                }
              }} 
            />
          </div>
          <CustomLegend />
        </div>
        <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>{chartType === 'expense' ? 'Spending' : 'Income'} Trend</h3>
            {getCurrentPeriodInfo() && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>{getCurrentPeriodInfo()}</span>}
          </div>
          <div style={{ height: '320px', flex: 1 }}>
            <Bar 
              ref={barRef}
              data={{ labels: barDataObj.labels, datasets: barDataObj.datasets }} 
              options={{ 
                maintainAspectRatio: false, 
                scales: { 
                  x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, 
                  y: { 
                      type: 'logarithmic',
                      stacked: true, 
                      ticks: { 
                          font: { size: 10 }, 
                          callback: (val) => {
                              const numericVal = val as number;
                              if (numericVal === 0) return '0';
                              if (numericVal < 1000000) return '';
                              if (numericVal % 1000000 === 0) return `${numericVal / 1000000}M`;
                              return '';
                          }
                      } 
                  } 
                },
                plugins: {
                  legend: { display: false },
                  datalabels: { display: false }, // 막대 차트에는 라벨 숨김
                  tooltip: {
                    callbacks: {
                      title: (items: any) => barDataObj.originalKeys[items[0].dataIndex],
                      label: (context: any) => `${context.dataset.label}: ${context.raw.toLocaleString()}원`
                    }
                  }
                }
              }} 
            />
          </div>
          <CustomLegend />
        </div>
      </div>
    </div>
  );
};

export default SummaryCharts;
