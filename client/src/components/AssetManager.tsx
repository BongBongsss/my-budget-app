import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Landmark, TrendingUp, Wallet, CreditCard, PieChart as PieIcon } from 'lucide-react';
import { getAssets, addAsset, updateAsset, deleteAsset, Asset } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const AssetManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  // ... rest of state and effects ...
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    type: 'bank',
    balance: 0,
    memo: ''
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets();
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAdd = async () => {
    if (!newAsset.name) return;
    try {
      await addAsset(newAsset);
      setNewAsset({ name: '', type: 'bank', balance: 0, memo: '' });
      fetchAssets();
    } catch (err) {
      alert('자산 추가 실패');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateAsset(id, editForm);
      setEditingId(null);
      fetchAssets();
    } catch (err) {
      alert('자산 수정 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 자산을 삭제하시겠습니까? 관련 내역은 삭제되지 않지만 자산 목록에서 사라집니다.')) return;
    try {
      await deleteAsset(id);
      fetchAssets();
    } catch (err) {
      alert('자산 삭제 실패');
    }
  };

  const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
  const netAssets = totalAssets - totalLiabilities;

  // 자산 유형별 데이터 가공 (그래프용)
  const assetTypeLabels: Record<string, string> = {
    bank: '예적금',
    cash: '현금',
    stock: '주식',
    realestate: '부동산',
    liability: '부채',
    other: '기타'
  };

  const typeData = assets.reduce((acc: any, a) => {
    const typeLabel = assetTypeLabels[a.type] || a.type;
    acc[typeLabel] = (acc[typeLabel] || 0) + a.balance;
    return acc;
  }, {});

  const activeTypes = Object.keys(typeData).filter(type => typeData[type] > 0);
  const chartPalette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  const chartData = {
    labels: activeTypes,
    datasets: [{
      data: activeTypes.map(type => typeData[type]),
      backgroundColor: activeTypes.map((_, i) => chartPalette[i % chartPalette.length]),
      borderWidth: 1,
      borderColor: '#fff'
    }]
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 자산 요약 헤더 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card-summary balance shadow-md"><div className="icon"><TrendingUp size={24}/></div><div className="details"><span>총 순자산</span><h2>{netAssets.toLocaleString()}</h2></div></div>
        <div className="card-summary income shadow-md"><div className="icon"><Landmark size={24}/></div><div className="details"><span>총 자산</span><h2>{totalAssets.toLocaleString()}</h2></div></div>
        <div className="card-summary expense shadow-md"><div className="icon"><CreditCard size={24}/></div><div className="details"><span>총 부채</span><h2>{totalLiabilities.toLocaleString()}</h2></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 왼쪽: 자산 추가 */}
        <div className="card-form shadow-md flex flex-col justify-between" style={{ minHeight: '400px' }}>
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus size={22} className="text-blue-500" /> 자산 추가</h3>
            <div className="space-y-4">
              <input type="text" placeholder="자산 이름" className="w-full p-2 border rounded" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
              <select className="w-full p-2 border rounded" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}>
                <option value="bank">🏦 예적금</option><option value="cash">💵 현금</option><option value="stock">📈 주식</option><option value="realestate">🏠 부동산</option><option value="liability">💳 부채</option><option value="other">📦 기타</option>
              </select>
              <input type="number" placeholder="잔액" className="w-full p-2 border rounded" value={newAsset.balance} onChange={e => setNewAsset({...newAsset, balance: parseFloat(e.target.value) || 0})} />
            </div>
          </div>
          <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-3 rounded font-bold mt-6">자산 등록하기</button>
        </div>

        {/* 오른쪽: 그래프 (원형 + 막대) */}
        <div className="card-form shadow-md p-6" style={{ minHeight: '400px' }}>
            <h3 className="text-lg font-bold mb-4">시각화 현황</h3>
            <div className="grid grid-cols-2 gap-4 h-full">
                <div><h4 className="text-xs font-bold text-gray-500 mb-2">구성비</h4><Pie data={chartData} options={{plugins:{legend:{display:false}}}} /></div>
                <div><h4 className="text-xs font-bold text-gray-500 mb-2">잔액 현황</h4><Bar data={barData} options={{plugins:{legend:{display:false}}}} /></div>
            </div>
        </div>
      </div>

      {/* 자산 리스트 (아래쪽 전체 너비) */}
      <div className="transaction-list shadow-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Wallet size={20} className="text-blue-500" /> 내 자산 목록
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border-b">자산명</th>
                <th className="p-3 text-left border-b">유형</th>
                <th className="p-3 text-right border-b">잔액</th>
                <th className="p-3 text-center border-b">관리</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">등록된 자산이 없습니다.</td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset.id} className={`hover:bg-gray-50 transition-colors ${editingId === asset.id ? 'bg-blue-50' : ''}`}>
                    <td className="p-3 border-b font-medium">
                      {editingId === asset.id ? (
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : asset.name}
                    </td>
                    <td className="p-3 border-b text-sm text-gray-600">
                      {editingId === asset.id ? (
                        <select
                          className="w-full p-1 border rounded"
                          value={editForm.type}
                          onChange={e => setEditForm({ ...editForm, type: e.target.value as any })}
                        >
                          <option value="bank">🏦 예적금</option>
                          <option value="cash">💵 현금</option>
                          <option value="stock">📈 주식</option>
                          <option value="realestate">🏠 부동산</option>
                          <option value="liability">💳 부채</option>
                          <option value="other">📦 기타</option>
                        </select>
                      ) : (
                        <span className="flex items-center gap-1">
                          {asset.type === 'bank' && '🏦'}
                          {asset.type === 'cash' && '💵'}
                          {asset.type === 'stock' && '📈'}
                          {asset.type === 'realestate' && '🏠'}
                          {asset.type === 'liability' && '💳'}
                          {asset.type === 'other' && '📦'}
                          {asset.type}
                        </span>
                      )}
                    </td>
                    <td className={`p-3 border-b text-right font-bold ${asset.type === 'liability' ? 'text-red-500' : 'text-gray-800'}`}>
                      {editingId === asset.id ? (
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-right"
                          value={editForm.balance}
                          onChange={e => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        `${asset.balance.toLocaleString()}원`
                      )}
                    </td>
                    <td className="p-3 border-b text-center">
                      <div className="flex justify-center gap-2">
                        {editingId === asset.id ? (
                          <>
                            <button onClick={() => handleUpdate(asset.id!)} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(asset.id!); setEditForm(asset); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(asset.id!)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetManager;
