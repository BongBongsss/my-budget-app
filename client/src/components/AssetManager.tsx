import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Landmark, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { getAssets, addAsset, updateAsset, deleteAsset, getAssetHistory, saveAssetHistory, Asset } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

const AssetManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '', type: 'bank', balance: 0, memo: ''
  });

  const fetchData = async () => {
    try {
      const [res, histRes] = await Promise.all([getAssets(), getAssetHistory()]);
      setAssets(res.data);
      setHistory(histRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!newAsset.name) return;
    await addAsset(newAsset);
    setNewAsset({ name: '', type: 'bank', balance: 0, memo: '' });
    fetchData();
  };

  const handleUpdate = async (id: string) => {
    await updateAsset(id, editForm);
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('삭제하시겠습니까?')) {
      await deleteAsset(id);
      fetchData();
    }
  };

  const handleSaveHistory = async () => {
    await saveAssetHistory();
    fetchData();
  };

  const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
  const netAssets = totalAssets - totalLiabilities;

  const assetTypeMap: Record<string, string> = {
    bank: '🏦 예적금', cash: '💵 현금', stock: '📈 주식', 
    realestate: '🏠 부동산', liability: '💳 부채', other: '📦 기타'
  };

  const groupedAssets = assets.reduce((acc, a) => {
    const typeName = assetTypeMap[a.type] || '기타';
    acc[typeName] = (acc[typeName] || 0) + a.balance;
    return acc;
  }, {} as Record<string, number>);

  const totalBalanceForPie = Object.values(groupedAssets).reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels: Object.keys(groupedAssets),
    datasets: [{
      data: Object.values(groupedAssets),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'],
    }]
  };

  const lineData = {
    labels: history.map(h => h.yearMonth),
    datasets: [
        { label: '총 자산', data: history.map(h => h.totalAssets), borderColor: '#10b981', tension: 0.1 },
        { label: '총 부채', data: history.map(h => h.totalLiabilities), borderColor: '#ef4444', tension: 0.1 },
        { label: '순자산', data: history.map(h => h.netAssets), borderColor: '#3b82f6', tension: 0.1 }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card-summary balance shadow-md"><div className="icon"><TrendingUp size={24}/></div><div className="details"><span>총 순자산</span><h2>{netAssets.toLocaleString()}</h2></div></div>
        <div className="card-summary income shadow-md"><div className="icon"><Landmark size={24}/></div><div className="details"><span>총 자산</span><h2>{totalAssets.toLocaleString()}</h2></div></div>
        <div className="card-summary expense shadow-md"><div className="icon"><CreditCard size={24}/></div><div className="details"><span>총 부채</span><h2>{totalLiabilities.toLocaleString()}</h2></div></div>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start">
        <div className="card-form shadow-md p-6" style={{ minHeight: '400px' }}>
            <h3 className="text-lg font-bold mb-6">자산 구성비</h3>
            <div style={{ height: '300px' }}>
                <Pie 
                    data={chartData} 
                    options={{ 
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: false },
                            datalabels: {
                                formatter: (value: any, ctx: any) => {
                                    const label = ctx.chart.data.labels?.[ctx.dataIndex];
                                    const cleanLabel = (label as string).replace(/[🏦💵📈🏠💳📦]/g, '');
                                    return `${cleanLabel}\n${(value / totalBalanceForPie * 100).toFixed(1)}%`;
                                },
                                color: '#333', font: { weight: 'bold', size: 10 }
                            }
                        }
                    }} 
                />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Object.keys(groupedAssets).map((type, index) => (
                    <div key={type} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded" style={{ fontSize: '0.65rem' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'][index % 6] }} />
                        {type.replace(/[🏦💵📈🏠💳📦]/g, '')}
                    </div>
                ))}
            </div>
        </div>

        <div className="card-form shadow-md p-6" style={{ minHeight: '400px' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">자산 변화 추이</h3>
                <button onClick={handleSaveHistory} className="btn btn-primary text-xs py-1 px-3">이력 저장</button>
            </div>
            <div style={{ height: '300px' }}>
                <Line 
                    data={lineData} 
                    options={{ 
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: true },
                            datalabels: { display: false }
                        },
                        scales: {
                        y: {
                        ticks: {
                            callback: (value: any) => `${(value / 1000000000).toFixed(1)}B`
                        }
                        }
                        }                    }} 
                />
            </div>
        </div>
      </div>

      <div className="card-form shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Plus size={22} className="text-blue-500" /> 자산 추가</h3>
            <button onClick={handleAdd} className="btn btn-primary flex items-center gap-1 text-sm py-1.5 px-3">
              <Plus size={16} /> 등록
            </button>
          </div>
          <div className="space-y-2">
            <div className="form-group">
              <label className="text-xs font-bold text-gray-500 mb-0.5 block">자산 이름</label>
              <input type="text" placeholder="예: 국민은행 예금" className="w-full p-1.5 border rounded text-sm" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                    <label className="text-xs font-bold text-gray-500 mb-0.5 block">자산 유형</label>
                    <select className="w-full p-1.5 border rounded text-sm" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}>
                        <option value="bank">🏦 예적금</option><option value="cash">💵 현금</option><option value="stock">📈 주식</option><option value="realestate">🏠 부동산</option><option value="liability">💳 부채</option><option value="other">📦 기타</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="text-xs font-bold text-gray-500 mb-0.5 block">현재 잔액</label>
                    <input type="number" placeholder="0" className="w-full p-1.5 border rounded text-sm" value={newAsset.balance} onChange={e => setNewAsset({...newAsset, balance: parseFloat(e.target.value) || 0})} />
                </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-bold text-gray-500 mb-0.5 block">메모</label>
              <input type="text" placeholder="기타 정보" className="w-full p-1.5 border rounded text-sm" value={newAsset.memo} onChange={e => setNewAsset({...newAsset, memo: e.target.value})} />
            </div>
          </div>
        </div>

      <div className="transaction-list shadow-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Wallet size={20} className="text-blue-500" /> 내 자산 목록</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border-b">자산명</th><th className="p-3 text-left border-b">유형</th><th className="p-3 text-right border-b">잔액</th><th className="p-3 text-center border-b">관리</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? <tr><td colSpan={4} className="p-10 text-center text-gray-400">등록된 자산이 없습니다.</td></tr> : assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b font-medium">{editingId === asset.id ? <input className="w-full p-1 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : asset.name}</td>
                    <td className="p-3 border-b text-sm text-gray-600">{asset.type}</td>
                    <td className="p-3 border-b text-right font-bold">{asset.balance.toLocaleString()}원</td>
                    <td className="p-3 border-b text-center flex justify-center gap-1">
                      {editingId === asset.id ? (
                        <>
                          <button onClick={() => handleUpdate(asset.id!)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(asset.id!); setEditForm(asset); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(asset.id!)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
