import React from 'react';
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

  // 1. 데이터 집계 및 0원 항목 필터링
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const groupName = getGroupName(t.category);
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {});

  // 금액이 0보다 큰 그룹만 추출
  const activeGroups = Object.keys(categoryData)
    .filter(group => categoryData[group] > 0)
    .sort((a, b) => categoryData[b] - categoryData[a]);

  const totalExpense = activeGroups.reduce((sum, group) => sum + categoryData[group], 0);

  // 그룹별 고정 색상 맵 (활성 그룹 기준)
  const groupColorMap: Record<string, string> = {};
  activeGroups.forEach((group, idx) => {
    groupColorMap[group] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
  });

  const pieData = {
    labels: activeGroups,
    datasets: [{
      data: activeGroups.map(group => categoryData[group]),
      backgroundColor: activeGroups.map(group => groupColorMap[group]),
    }]
  };

  const commonOptions = {
    onHover: (event: any, chartElement: any) => {
      event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        onHover: (event: any, legendItem: any, legend: any) => {
          const index = legendItem.index;
          const chart = legend.chart;
          chart.setActiveElements([{ datasetIndex: 0, index }]);
          chart.update();
        },
        onLeave: (event: any, legendItem: any, legend: any) => {
          const chart = legend.chart;
          chart.setActiveElements([]);
          chart.update();
        },
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 }
        }
      },
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
      <div className="card-form">
        <h3>Category Group Breakdown</h3>
        <div style={{ height: '320px' }}>
          <Pie data={pieData} options={{ ...commonOptions, maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="card-form">
        <h3>Spending Trend (by Group)</h3>
        <div style={{ height: '320px' }}>
          <Bar 
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
      </div>
    </div>
  );
};

export default SummaryCharts;
