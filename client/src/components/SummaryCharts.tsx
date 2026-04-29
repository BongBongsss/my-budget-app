import React, { useState, useRef } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LogarithmicScale, LinearScale, PointElement, BarElement, Title);

interface SummaryChartsProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  period: 'all' | 'month' | 'year';
}

const SummaryCharts: React.FC<SummaryChartsProps> = ({ transactions, categories, period }) => {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const pieRef = useRef<any>(null);
  const barRef = useRef<any>(null);

  const COLOR_PALETTE = [
    '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#818cf8', '#a78bfa', '#fb7185',
    '#2dd4bf', '#a3e635', '#f472b6', '#94a3b8', '#60a5fa'
  ];

  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryToGroupMap[cat.name] = cat.groupName || '기타';
  });

  const getGroupName = (categoryName: string) => {
    return categoryToGroupMap[categoryName] || categoryName.split('>')[0].trim() || '기타';
  };

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const groupName = getGroupName(t.category);
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {});

  const activeGroups = Object.keys(categoryData)
    .filter(group => categoryData[group] > 0)
    .sort((a, b) => categoryData[b] - categoryData[a]);

  const totalExpense = activeGroups.reduce((sum, group) => sum + categoryData[group], 0);

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
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '15px', padding: '0 10px' }}>
      {activeGroups.map((group) => (
        <div key={group} onMouseEnter={() => handleLegendHover(group)} onMouseLeave={() => handleLegendHover(null)} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: hoveredGroup === group ? '#f1f5f9' : 'transparent', transition: 'all 0.2s' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: groupColorMap[group] }} />
          <span style={{ fontSize: '0.7rem', fontWeight: hoveredGroup === group ? 'bold' : 'normal', color: hoveredGroup === group ? '#1e293b' : '#64748b' }}>
            {group}{hoveredGroup === group && <span style={{ marginLeft: '3px', color: '#3b82f6' }}>({categoryData[group].toLocaleString()}원)</span>}
          </span>
        </div>
      ))}
    </div>
  );

  const getBarData = () => {
    const grouped = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
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
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <h3>Category Group Breakdown</h3>
        <div style={{ height: '300px', flex: 1 }}>
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
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      const value = context.raw || 0;
                      const percentage = ((value / totalExpense) * 100).toFixed(1);
                      return `${context.label}: ${value.toLocaleString()}원 (${percentage}%)`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
        <CustomLegend />
      </div>
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Spending Trend</h3>
          {getCurrentPeriodInfo() && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>{getCurrentPeriodInfo()}</span>}
        </div>
        <div style={{ height: '300px', flex: 1 }}>
          <Bar 
            ref={barRef}
            data={{ labels: barDataObj.labels, datasets: barDataObj.datasets }} 
            options={{ 
              maintainAspectRatio: false, 
              scales: { 
                x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, 
                y: { 
                    type: 'logarithmic', // 로그 스케일 적용: 큰 금액 편차 극복
                    stacked: true, 
                    ticks: { 
                        font: { size: 10 }, 
                        callback: (val) => {
                            if (val === 0) return '0';
                            if (Math.log10(val as number) % 1 === 0) return val.toLocaleString(); // 10, 100, 1000 단위만 표시
                            return '';
                        }
                    } 
                } 
              },
              plugins: {
                legend: { display: false },
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
  );
};

export default SummaryCharts;
