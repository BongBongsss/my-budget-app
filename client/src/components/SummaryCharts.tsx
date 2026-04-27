import React from 'react';
import { Transaction } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, BarElement, Title);

interface SummaryChartsProps {
  transactions: Transaction[];
  period: 'all' | 'month' | 'year';
}

const SummaryCharts: React.FC<SummaryChartsProps> = ({ transactions, period }) => {
  const categories = Array.from(new Set(transactions.map(t => t.category)));
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const mainCategory = t.category.split('>')[0].trim();
      acc[mainCategory] = (acc[mainCategory] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#818cf8'],
    }]
  };

  const getBarData = () => {
    const grouped = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
      let key;
      if (period === 'all') key = t.date.substring(0, 4); 
      else if (period === 'year') key = t.date.substring(0, 7); 
      else key = t.date.substring(0, 10);
      
      const mainCategory = t.category.split('>')[0].trim();
      if (!acc[key]) acc[key] = {};
      acc[key][mainCategory] = (acc[key][mainCategory] || 0) + t.amount;
      return acc;
    }, {});

    const labels = Object.keys(grouped).sort();
    const categoriesList = Array.from(new Set(transactions.map(t => t.category.split('>')[0].trim())));
    const datasets = categoriesList.map((cat, idx) => ({
      label: cat,
      data: labels.map(label => grouped[label][cat] || 0),
      backgroundColor: `hsl(${(idx * 360) / categoriesList.length}, 70%, 60%)`,
    }));

    return { labels, datasets };
  };

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div className="card-form">
        <h3>Category Breakdown</h3>
        <div style={{ height: '250px' }}>
          <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
      <div className="card-form">
        <h3>Spending Trend (Stacked)</h3>
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
