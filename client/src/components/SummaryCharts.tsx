import React, { useState, useRef } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, BarElement, Title);

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

  // 데이터 집계
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

  // 범례 마우스 오버 핸들러
  const handleLegendHover = (group: string | null) => {
    setHoveredGroup(group);
    
    // 차트 요소 강조 연동
    const index = group ? activeGroups.indexOf(group) : -1;
    
    if (pieRef.current) {
      const chart = pieRef.current;
      if (index >= 0) {
        chart.setActiveElements([{ datasetIndex: 0, index }]);
      } else {
        chart.setActiveElements([]);
      }
      chart.update();
    }
    
    if (barRef.current) {
      const chart = barRef.current;
      if (index >= 0) {
        // 모든 데이터셋에서 해당 인덱스의 막대를 강조
        const activeElements = chart.data.datasets.map((_: any, dsIndex: number) => ({
            datasetIndex: dsIndex,
            index: index // 실제로는 그룹별로 데이터셋이 나뉘어 있으므로 로직 확인 필요
        }));
        // 간단하게 해당 그룹 데이터셋 전체 강조
        chart.setActiveElements([{ datasetIndex: index, index: 0 }]); // 바 차트는 구조에 맞춰 조정
      } else {
        chart.setActiveElements([]);
      }
      chart.update();
    }
  };

  // 커스텀 범례 컴포넌트
  const CustomLegend = () => (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: '12px', 
      marginTop: '20px',
      padding: '0 10px'
    }}>
      {activeGroups.map((group) => (
        <div 
          key={group}
          onMouseEnter={() => handleLegendHover(group)}
          onMouseLeave={() => handleLegendHover(null)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: hoveredGroup === group ? '#f1f5f9' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: groupColorMap[group] 
          }} />
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: hoveredGroup === group ? 'bold' : 'normal',
            color: hoveredGroup === group ? '#1e293b' : '#64748b'
          }}>
            {group}
            {hoveredGroup === group && (
              <span style={{ marginLeft: '4px', color: '#3b82f6' }}>
                ({categoryData[group].toLocaleString()}원)
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );

  const commonOptions = {
    plugins: {
      legend: { display: false }, // 내장 범례 숨김
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || context.dataset.label || '';
            const value = context.raw || 0;
            if (context.chart.config.type === 'pie') {
              const percentage = ((value / totalExpense) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()}원 (${percentage}%)`;
            }
            return `${label}: ${value.toLocaleString()}원`;
          }
        }
      }
    }
  };

  const getBarData = () => {
    const grouped = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
      let key;
      if (period === 'all') key = t.date.substring(0, 4); 
      else if (period === 'year') key = t.date.substring(0, 7); 
      else key = t.date.substring(0, 10);
      
      const groupName = getGroupName(t.category);
      if (!acc[key]) acc[key] = {};
      acc[key][groupName] = (acc[key][groupName] || 0) + t.amount;
      return acc;
    }, {});

    const labels = Object.keys(grouped).sort();
    
    const datasets = activeGroups.map((group) => ({
      label: group,
      data: labels.map(label => grouped[label][group] || 0),
      backgroundColor: groupColorMap[group],
    }));

    return { labels, datasets };
  };

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3>Category Group Breakdown</h3>
        <div style={{ height: '250px', flex: 1 }}>
          <Pie 
            ref={pieRef}
            data={{
              labels: activeGroups,
              datasets: [{
                data: activeGroups.map(group => categoryData[group]),
                backgroundColor: activeGroups.map(group => groupColorMap[group]),
              }]
            }} 
            options={{ ...commonOptions, maintainAspectRatio: false }} 
          />
        </div>
        <CustomLegend />
      </div>
      <div className="card-form" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3>Spending Trend (by Group)</h3>
        <div style={{ height: '250px', flex: 1 }}>
          <Bar 
            ref={barRef}
            data={getBarData()} 
            options={{ 
              ...commonOptions,
              maintainAspectRatio: false, 
              scales: { 
                x: { stacked: true }, 
                y: { stacked: true, ticks: { callback: (val) => val.toLocaleString() } } 
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
