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
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');
  const pieRef = useRef<any>(null);
  const barRef = useRef<any>(null);

  const EXPENSE_PALETTE = ['#f87171', '#fb923c', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
  const INCOME_PALETTE = ['#4ade80', '#38bdf8', '#818cf8', '#2dd4bf', '#a3e635', '#60a5fa'];
  const COLOR_PALETTE = chartType === 'expense' ? EXPENSE_PALETTE : INCOME_PALETTE;

  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => { categoryToGroupMap[cat.name] = cat.groupName || '기타'; });

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
  activeGroups.forEach((group, idx) => { groupColorMap[group] = COLOR_PALETTE[idx % COLOR_PALETTE.length]; });

  const getCurrentPeriodInfo = () => {
    if (transactions.length === 0) return "";
    const firstDate = transactions[0].date;
    if (period === 'month') return firstDate.substring(0, 7); 
    if (period === 'year') return firstDate.substring(0, 4); 
    return "All Time";
  };

  // 요청 사항: 클릭 시 하이라이트 처리 (토글 방식)
  const handleGroupClick = (group: string) => {
    const newHighlight = activeHighlight === group ? null : group;
    setActiveHighlight(newHighlight);
    
    // 원형 차트 연동
    const index = newHighlight ? activeGroups.indexOf(newHighlight) : -1;
    if (pieRef.current) {
      if (index >= 0) pieRef.current.setActiveElements([{ datasetIndex: 0, index }]);
      else pieRef.current.setActiveElements([]);
      pieRef.current.update();
    }
    
    // 막대 차트 연동
    if (barRef.current) {
        barRef.current.update();
    }
  };

  const BarLegend = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
      {activeGroups.map((group) => (
        <div 
          key={group} 
          onClick={() => handleGroupClick(group)} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', 
            backgroundColor: activeHighlight === group ? '#f1f5f9' : 'transparent', 
            border: activeHighlight === group ? '1px solid #3b82f6' : '1px solid transparent',
            transition: 'all 0.2s' 
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: groupColorMap[group] }} />
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: activeHighlight === group ? 'bold' : 'normal' }}>{group}</span>
          {activeHighlight === group && <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#3b82f6' }}>({categoryData[group].toLocaleString()}원)</span>}
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
      acc[key] = 1; return acc;
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
      datasets: activeGroups.map(group => {
        const baseColor = groupColorMap[group];
        // 하이라이트 로직: 클릭된 항목만 진하게, 나머지는 투명하게
        const isSelected = activeHighlight === group;
        const noSelection = activeHighlight === null;
        
        return {
          label: group,
          backgroundColor: noSelection || isSelected ? baseColor : `${baseColor}33`,
          borderWidth: isSelected ? 1 : 0,
          borderColor: '#333',
          data: sortedKeys.map(key => {
            return filteredData.filter(t => {
                let tKey;
                if (period === 'all') tKey = t.date.substring(0, 4);
                else if (period === 'year') tKey = t.date.substring(0, 7);
                else tKey = t.date;
                return tKey === key && getGroupName(t.category) === group;
            }).reduce((sum, t) => sum + t.amount, 0);
          })
        };
      })
    };
  };

  const barDataObj = getBarData();

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <button onClick={() => {setChartType('expense'); setActiveHighlight(null);}} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'expense' ? '#fee2e2' : '#f1f5f9', color: chartType === 'expense' ? '#ef4444' : '#64748b', fontWeight: chartType === 'expense' ? 'bold' : 'normal' }}>
          <ArrowDownCircle size={18} /> 지출 분석
        </button>
        <button onClick={() => {setChartType('income'); setActiveHighlight(null);}} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: chartType === 'income' ? '#dcfce7' : '#f1f5f9', color: chartType === 'income' ? '#10b981' : '#64748b', fontWeight: chartType === 'income' ? 'bold' : 'normal' }}>
          <ArrowUpCircle size={18} /> 수입 분석
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6" onClick={(e) => {
          // 배경 클릭 시 하이라이트 해제 (버튼/범례 클릭 제외)
          if ((e.target as HTMLElement).classList.contains('grid')) {
              setActiveHighlight(null);
          }
      }}>
        <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px', padding: '15px', position: 'relative', overflow: 'visible' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', position: 'absolute', top: '15px', left: '15px', zIndex: 10 }}>{chartType === 'expense' ? 'Expense' : 'Income'} Breakdown</h3>
          <div style={{ height: '420px', flex: 1, marginTop: '30px', position: 'relative', overflow: 'visible' }}>
            <Pie 
              ref={pieRef}
              data={{
                labels: activeGroups,
                datasets: [{
                  data: activeGroups.map(group => categoryData[group]),
                  backgroundColor: activeGroups.map(group => groupColorMap[group]),
                  borderWidth: 1,
                  borderColor: '#fff'
                }]
              }} 
              options={{ 
                maintainAspectRatio: false,
                radius: '95%',
                layout: { padding: { left: 45, right: 45, top: 45, bottom: 45 } },
                onClick: (evt, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        handleGroupClick(activeGroups[index]);
                    } else {
                        setActiveHighlight(null);
                    }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                  datalabels: {
                    formatter: (value, ctx) => {
                      const label = ctx.chart.data.labels?.[ctx.dataIndex];
                      const percentage = ((value / totalAmount) * 100).toFixed(1);
                      return `${label}\n${percentage}%`;
                    },
                    color: '#000',
                    font: { weight: 'bold', size: 12 },
                    textAlign: 'center',
                    textStrokeColor: '#fff',
                    textStrokeWidth: 2,
                    anchor: 'end', 
                    align: 'start',
                    offset: (ctx) => {
                        const value = ctx.dataset.data[ctx.dataIndex] as number;
                        const percentage = (value / totalAmount) * 100;
                        return percentage >= 8 ? 30 : -45;
                    },
                    display: 'auto'
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="card-form" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{chartType === 'expense' ? 'Spending' : 'Income'} Trend</h3>
            {getCurrentPeriodInfo() && <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>{getCurrentPeriodInfo()}</span>}
          </div>
          <div style={{ height: '350px', flex: 1 }}>
            <Bar 
              ref={barRef}
              data={{ labels: barDataObj.labels, datasets: barDataObj.datasets }} 
              options={{ 
                maintainAspectRatio: false, 
                onClick: (evt, elements) => {
                    if (elements.length > 0) {
                        const datasetIndex = elements[0].datasetIndex;
                        handleGroupClick(activeGroups[datasetIndex]);
                    } else {
                        setActiveHighlight(null);
                    }
                },
                scales: { 
                  x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, 
                  y: { 
                      type: 'logarithmic',
                      stacked: true, 
                      ticks: { 
                          font: { size: 10 }, 
                          callback: (val) => {
                              const v = val as number;
                              if (v === 0) return '0';
                              if (v < 1000000) return '';
                              if (v % 1000000 === 0) return `${v / 1000000}M`;
                              return '';
                          }
                      } 
                  } 
                },
                plugins: {
                  legend: { display: false },
                  datalabels: { display: false },
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
          <BarLegend />
        </div>
      </div>
    </div>
  );
};

export default SummaryCharts;
