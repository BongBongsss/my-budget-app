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
  // 공통 색상 팔레트
  const COLOR_PALETTE = [
    '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#818cf8', '#a78bfa', '#fb7185',
    '#2dd4bf', '#a3e635', '#f472b6', '#94a3b8', '#fb923c', '#60a5fa', '#f87171'
  ];

  // 카테고리 이름을 그룹 이름으로 변환하는 맵 생성
  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryToGroupMap[cat.name] = cat.groupName || '기타';
  });

  const getGroupName = (categoryName: string) => {
    return categoryToGroupMap[categoryName] || categoryName.split('>')[0].trim() || '기타';
  };

  const allGroups = Array.from(new Set(Object.values(categoryToGroupMap))).sort();
  
  // 그룹별 고정 색상 맵 생성
  const groupColorMap: Record<string, string> = {};
  allGroups.forEach((group, idx) => {
    groupColorMap[group] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
  });

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const groupName = getGroupName(t.category);
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {});

  const pieLabels = Object.keys(categoryData);
  const pieData = {
    labels: pieLabels,
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: pieLabels.map(label => groupColorMap[label] || '#94a3b8'),
    }]
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
    
    const datasets = allGroups.map((group) => ({
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
        <div style={{ height: '250px' }}>
          <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
      <div className="card-form">
        <h3>Spending Trend (by Group)</h3>
        <div style={{ height: '250px' }}>
          <Bar 
            data={getBarData()} 
            options={{ 
              maintainAspectRatio: false, 
              scales: { x: { stacked: true }, y: { stacked: true } } 
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryCharts;
