import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, X, Landmark, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { getAssets, addAsset, updateAsset, deleteAsset, getAssetHistory, saveAssetHistory, Asset } from '../api';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import EntryModal from './EntryModal';

ChartJS.register(Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, LineElement, PointElement, Title);

interface AssetManagerProps {
  userRole?: 'admin' | 'viewer';
  isAddOpen?: boolean;
  onCloseAdd?: () => void;
}

const ASSET_MEMBER_OPTIONS: Asset['member'][] = ['효', '굥', '봉', '공동'];

const AssetManager: React.FC<AssetManagerProps> = ({ userRole = 'viewer', isAddOpen = false, onCloseAdd }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');
  const [balanceSortOrder, setBalanceSortOrder] = useState<'asc' | 'desc' | 'default'>('default');
  const originalAssets = useRef<Asset[]>([]);
  const [editForm, setEditForm] = useState<Partial<Asset>>({});
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '', type: 'bank', balance: 0, member: '공동', memo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileChartView, setMobileChartView] = useState<'composition' | 'trend'>('composition');
  const [expandedMobileAssetIds, setExpandedMobileAssetIds] = useState<Set<string>>(new Set());
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);

  const toggleMobileAssetDetails = (id: string) => {
    setExpandedMobileAssetIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchData = async () => {
    try {
      const [res, histRes] = await Promise.all([getAssets(), getAssetHistory()]);
      setAssets(res.data);
      originalAssets.current = res.data;
      setHistory(histRes.data);
    } catch (err: any) { 
      console.error('Failed to fetch assets:', err); 
      alert(`데이터를 가져오는 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSort = () => {
    let nextOrder: 'asc' | 'desc' | 'default';
    if (sortOrder === 'default') nextOrder = 'asc';
    else if (sortOrder === 'asc') nextOrder = 'desc';
    else nextOrder = 'default';

    setSortOrder(nextOrder);
    setBalanceSortOrder('default');

    if (nextOrder === 'default') {
        setAssets(originalAssets.current);
    } else {
        const sorted = [...assets].sort((a, b) => {
            const typeA = assetTypeMap[a.type] || a.type;
            const typeB = assetTypeMap[b.type] || b.type;
            return nextOrder === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
        });
        setAssets(sorted);
    }
  };

  const handleSortBalance = () => {
    let nextOrder: 'asc' | 'desc' | 'default';
    if (balanceSortOrder === 'default') nextOrder = 'asc';
    else if (balanceSortOrder === 'asc') nextOrder = 'desc';
    else nextOrder = 'default';

    setBalanceSortOrder(nextOrder);
    setSortOrder('default');

    if (nextOrder === 'default') {
        setAssets(originalAssets.current);
    } else {
        const sorted = [...assets].sort((a, b) => {
            return nextOrder === 'asc' ? a.balance - b.balance : b.balance - a.balance;
        });
        setAssets(sorted);
    }
  };

  const handleAdd = async () => {
    if (!newAsset.name || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addAsset(newAsset);
      setNewAsset({ name: '', type: 'bank', balance: 0, member: '공동', memo: '' });
      await fetchData();
      onCloseAdd?.();
    } catch (err: any) {
      console.error('Failed to add asset:', err);
      alert(`자산 추가 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateAsset(id, editForm);
      setEditingId(null);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to update asset:', err);
      alert(`자산 수정 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isSubmitting) return;
    if (confirm('삭제하시겠습니까?')) {
      setIsSubmitting(true);
      try {
        await deleteAsset(id);
        await fetchData();
      } catch (err: any) {
        console.error('Failed to delete asset:', err);
        alert(`자산 삭제 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveHistory = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await saveAssetHistory();
      await fetchData();
    } catch (err: any) {
      console.error('Failed to save history:', err);
      alert(`이력 저장 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAssets = assets.reduce((sum, a) => a.type !== 'liability' ? sum + a.balance : sum, 0);
  const totalLiabilities = assets.reduce((sum, a) => a.type === 'liability' ? sum + a.balance : sum, 0);
  const netAssets = totalAssets - totalLiabilities;
  const isAdmin = userRole === 'admin';

  const assetTypeMap: Record<string, string> = {
    bank: '예적금', cash: '현금', stock: '주식', 
    realestate: '부동산', pension: '연금', insurance: '보험',
    liability: '부채', other: '기타'
  };

  const groupedAssets = assets.reduce((acc, a) => {
    const typeName = assetTypeMap[a.type] || '기타';
    acc[typeName] = (acc[typeName] || 0) + a.balance;
    return acc;
  }, {} as Record<string, number>);

  const totalBalanceForPie = Object.values(groupedAssets).reduce((sum, val) => sum + val, 0);

  const sortedGroupedEntries = Object.entries(groupedAssets)
    .sort(([, a], [, b]) => b - a);

  const visibleAssets = selectedAssetType
    ? assets.filter((asset) => (assetTypeMap[asset.type] || asset.type) === selectedAssetType)
    : assets;

  const lineData = {
    labels: history.map(h => h.yearMonth),
    datasets: [
        { label: '총 자산', data: history.map(h => h.totalAssets), borderColor: '#10b981', tension: 0.1 },
        { label: '총 부채', data: history.map(h => h.totalLiabilities), borderColor: '#ef4444', tension: 0.1 },
        { label: '순자산', data: history.map(h => h.netAssets), borderColor: '#3b82f6', tension: 0.1 }
    ]
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto">
      <div className="grid grid-cols-3 gap-6 mb-8 asset-summary-cards">
        <div className="card-summary income shadow-md">
            <div className="icon"><Landmark size={24}/></div>
            <div className="details">
                <span>자산 (100.0%)</span>
                <h2>{totalAssets.toLocaleString()}</h2>
            </div>
        </div>
        <div className="card-summary expense shadow-md">
            <div className="icon"><CreditCard size={24}/></div>
            <div className="details">
                <span>부채 ({totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%)</span>
                <h2>{totalLiabilities.toLocaleString()}</h2>
            </div>
        </div>
        <div className="card-summary balance shadow-md">
            <div className="icon"><TrendingUp size={24}/></div>
            <div className="details">
                <span>순자산 ({totalAssets > 0 ? ((netAssets / totalAssets) * 100).toFixed(1) : 0}%)</span>
                <h2>{netAssets.toLocaleString()}</h2>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 items-start mb-8 asset-desktop-charts">
        <div className="card-form shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ margin: 0 }}>자산 구성비</h3>
            </div>
            <div className="desktop-asset-composition-list">
                {sortedGroupedEntries.map(([type, value], index) => {
                  const percentage = totalBalanceForPie ? (value / totalBalanceForPie) * 100 : 0;
                  const isSelected = selectedAssetType === type;
                  const isDimmed = !!selectedAssetType && !isSelected;
                  return (
                    <button
                      type="button"
                      className={`desktop-asset-composition-bar ${isSelected ? 'is-selected' : ''}`}
                      key={type}
                      aria-pressed={isSelected}
                      style={{ opacity: isDimmed ? 0.35 : 1 }}
                      onClick={() => setSelectedAssetType((current) => current === type ? null : type)}
                    >
                      <span className="desktop-asset-composition-fill" style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'][index % 6] }} />
                      <span className="desktop-asset-composition-label">{type} ({percentage.toFixed(1)}%)</span>
                      <span className="desktop-asset-composition-amount">{(value / 100000000).toFixed(2)}억원</span>
                    </button>
                  );
                })}
            </div>
        </div>

        <div className="card-form shadow-md p-4" style={{ minHeight: '520px' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ margin: 0 }}>자산 변화 추이</h3>
                <button onClick={handleSaveHistory} className="btn btn-primary text-xs py-1 px-3">이력 저장</button>
            </div>
            <div style={{ height: '420px', width: '100%' }}>
                <Line 
                    data={lineData} 
                    options={{ 
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: true, labels: { font: { size: 12 } } },
                            datalabels: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 2000000000,
                                ticks: {
                                    stepSize: 500000000,
                                    font: { size: 12 },
                                    callback: (value: any) => `${(value / 1000000000).toFixed(1)}B`
                                }
                            }
                        }                    }} 
                />
            </div>
        </div>
      </div>

      <div className="mobile-asset-chart card-form shadow-md">
        <div className="mobile-asset-chart-header">
          <h3>{mobileChartView === 'composition' ? '자산 구성비' : '자산 변화 추이'}</h3>
          <div className="mobile-asset-chart-tabs">
            <button type="button" className={mobileChartView === 'composition' ? 'is-active' : ''} onClick={() => setMobileChartView('composition')}>구성비</button>
            <button type="button" className={mobileChartView === 'trend' ? 'is-active' : ''} onClick={() => setMobileChartView('trend')}>변화 추이</button>
          </div>
        </div>
        {mobileChartView === 'composition' ? (
          <div className="mobile-asset-composition-list">
            {sortedGroupedEntries.map(([type, value], index) => {
              const percentage = totalBalanceForPie ? (value / totalBalanceForPie) * 100 : 0;
              return (
                <div className="mobile-asset-composition-item" key={type}>
                  <button
                    type="button"
                    className={`mobile-comparison-bar mobile-asset-composition-bar ${selectedAssetType === type ? 'is-selected' : ''}`}
                    aria-pressed={selectedAssetType === type}
                    onClick={() => setSelectedAssetType((current) => current === type ? null : type)}
                  >
                    <span
                      className="mobile-comparison-bar-fill"
                      style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'][index % 6] }}
                    />
                    <span className="mobile-asset-composition-label">{type} ({percentage.toFixed(1)}%)</span>
                    <span className="mobile-asset-composition-amount">{(value / 100000000).toFixed(2)}억원</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {isAdmin && <button onClick={handleSaveHistory} className="btn btn-secondary mobile-history-save">이력 저장</button>}
            <div className="mobile-asset-chart-area">
              <Line
                data={lineData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 9 } } }, datalabels: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { font: { size: 9 }, callback: (value) => `${(Number(value) / 100000000).toFixed(0)}억` } } },
                }}
              />
            </div>
          </>
        )}
      </div>

      {isAdmin && isAddOpen && <EntryModal title="자산 등록" onClose={onCloseAdd || (() => undefined)}><div className="card-form entry-asset-form shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">자산 추가</h3>
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
                        <option value="bank">예적금</option><option value="cash">현금</option><option value="stock">주식</option><option value="realestate">부동산</option><option value="pension">연금</option><option value="insurance">보험</option><option value="liability">부채</option><option value="other">기타</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="text-xs font-bold text-gray-500 mb-0.5 block">현재 잔액</label>
                    <input type="number" placeholder="0" className="w-full p-1.5 border rounded text-sm" value={newAsset.balance} onChange={e => setNewAsset({...newAsset, balance: parseFloat(e.target.value) || 0})} />
                </div>
            </div>
            <div className="form-group">
              <label className="text-xs font-bold text-gray-500 mb-0.5 block">구성원</label>
              <select className="w-full p-1.5 border rounded text-sm" value={newAsset.member || '공동'} onChange={e => setNewAsset({ ...newAsset, member: e.target.value as Asset['member'] })}>
                {ASSET_MEMBER_OPTIONS.map((member) => <option key={member} value={member}>{member}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="text-xs font-bold text-gray-500 mb-0.5 block">메모</label>
              <input type="text" placeholder="기타 정보" className="w-full p-1.5 border rounded text-sm" value={newAsset.memo} onChange={e => setNewAsset({...newAsset, memo: e.target.value})} />
            </div>
          </div>
        </div></EntryModal>}

      <div className="transaction-list shadow-md" style={{ marginTop: '1rem' }}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">내 자산 목록</h3>
        <div className="desktop-asset-table overflow-x-auto">
          <table className="asset-list-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left border-b">자산명</th>
                <th className="p-3 text-left border-b cursor-pointer hover:bg-gray-200" onClick={handleSort}>유형 {sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '↕'}</th>
                <th className="p-3 text-left border-b">구성원</th>
                <th className="p-3 border-b cursor-pointer hover:bg-gray-200" style={{ textAlign: 'center' }} onClick={handleSortBalance}>잔액 {balanceSortOrder === 'asc' ? '▲' : balanceSortOrder === 'desc' ? '▼' : '↕'}</th>
                <th className="p-3 text-left border-b">등록일</th>
                <th className="p-3 text-left border-b">수정일</th>
                <th className="p-3 text-left border-b">메모</th>
                <th className="p-3 border-b" style={{ textAlign: 'center', width: '100px' }}>관리</th>
                </tr>
                </thead>
                <tbody>
                {visibleAssets.length === 0 ? <tr><td colSpan={8} className="p-10 text-center text-gray-400">등록된 자산이 없습니다.</td></tr> : visibleAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b font-medium">{editingId === asset.id ? <input className="w-full p-1 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : asset.name}</td>
                    <td className="p-3 border-b text-sm text-gray-600">
                      {editingId === asset.id ? (
                        <select className="w-full p-1 border rounded" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as any})}>
                          <option value="bank">예적금</option><option value="cash">현금</option><option value="stock">주식</option><option value="realestate">부동산</option><option value="pension">연금</option><option value="insurance">보험</option><option value="liability">부채</option><option value="other">기타</option>
                        </select>
                      ) : (
                        (assetTypeMap[asset.type] || asset.type)
                      )}
                    </td>
                    <td className="p-3 border-b text-sm text-gray-600">
                      {editingId === asset.id ? (
                        <select className="w-full p-1 border rounded" value={editForm.member || '공동'} onChange={e => setEditForm({ ...editForm, member: e.target.value as Asset['member'] })}>
                          {ASSET_MEMBER_OPTIONS.map((member) => <option key={member} value={member}>{member}</option>)}
                        </select>
                      ) : (
                        asset.member || '공동'
                      )}
                    </td>
                    <td className="p-3 border-b font-bold" style={{ textAlign: 'right' }}>
                      {editingId === asset.id ? (
                        <input type="number" className="w-full p-1 border rounded text-right" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: parseFloat(e.target.value) || 0})} />
                      ) : (
                        asset.balance.toLocaleString()
                      )}
                    </td>
                    <td className="p-3 border-b text-sm text-gray-500">{asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="p-3 border-b text-sm text-gray-500">{asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '-'}</td>
                    <td className="p-3 border-b text-sm text-gray-600">{editingId === asset.id ? <input className="w-full p-1 border rounded" value={editForm.memo || ''} onChange={e => setEditForm({...editForm, memo: e.target.value})} /> : asset.memo}</td>
                    <td className="p-3 border-b text-center">
                      {isAdmin && (
                      <div className="flex justify-center gap-1">
                      {editingId === asset.id ? (
                        <>
                          <button onClick={() => handleUpdate(asset.id!)} className="btn-icon edit"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="btn-icon delete"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(asset.id!); setEditForm(asset); }} className="btn-icon edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(asset.id!)} className="btn-icon delete"><Trash2 size={16} /></button>
                        </>
                      )}
                      </div>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
          </table>
        </div>

        <div className="mobile-asset-cards">
          <div className="mobile-asset-sort">
            <button type="button" className="btn btn-secondary" onClick={handleSort}>
              유형 정렬 {sortOrder === 'asc' ? '↑' : sortOrder === 'desc' ? '↓' : '↕'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleSortBalance}>
              잔액 정렬 {balanceSortOrder === 'asc' ? '↑' : balanceSortOrder === 'desc' ? '↓' : '↕'}
            </button>
          </div>

          {visibleAssets.length === 0 ? (
            <div className="mobile-asset-empty">등록된 자산이 없습니다.</div>
          ) : visibleAssets.map((asset) => (
            <article
              className={`mobile-asset-card ${expandedMobileAssetIds.has(asset.id!) ? 'is-expanded' : ''}`}
              key={`mobile-${asset.id}`}
              onClick={() => editingId !== asset.id && toggleMobileAssetDetails(asset.id!)}
            >
              {editingId === asset.id ? (
                <>
                  <div className="mobile-asset-edit-grid">
                    <label>자산명<input value={editForm.name || ''} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label>
                    <label>유형
                      <select value={editForm.type} onChange={(event) => setEditForm({ ...editForm, type: event.target.value as Asset['type'] })}>
                        <option value="bank">저축/예금</option><option value="cash">현금</option><option value="stock">주식</option><option value="realestate">부동산</option><option value="pension">연금</option><option value="insurance">보험</option><option value="liability">부채</option><option value="other">기타</option>
                      </select>
                    </label>
                    <label>구성원
                      <select value={editForm.member || '공동'} onChange={(event) => setEditForm({ ...editForm, member: event.target.value as Asset['member'] })}>
                        {ASSET_MEMBER_OPTIONS.map((member) => <option key={member} value={member}>{member}</option>)}
                      </select>
                    </label>
                    <label>잔액<input type="number" value={editForm.balance ?? 0} onChange={(event) => setEditForm({ ...editForm, balance: parseFloat(event.target.value) || 0 })} /></label>
                    <label className="mobile-asset-edit-wide">메모<input value={editForm.memo || ''} onChange={(event) => setEditForm({ ...editForm, memo: event.target.value })} /></label>
                  </div>
                  <div className="mobile-asset-actions">
                    <button className="btn btn-primary" onClick={() => handleUpdate(asset.id!)}><Check size={16} /> 저장</button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}><X size={16} /> 취소</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mobile-asset-topline">
                    <span>{assetTypeMap[asset.type] || asset.type}</span>
                    <strong>{asset.balance.toLocaleString()}원</strong>
                  </div>
                  <div className="mobile-asset-name">{asset.name}</div>
                  <div className="mobile-asset-meta">구성원: {asset.member || '공동'}</div>
                  {asset.memo && <div className="mobile-asset-note">{asset.memo}</div>}
                  <div className="mobile-asset-meta">수정: {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : '-'}</div>
                  {isAdmin && (
                    <div className="mobile-asset-actions">
                      <button className="btn btn-secondary" onClick={() => { setEditingId(asset.id!); setEditForm(asset); }}><Edit2 size={16} /> 수정</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(asset.id!)}><Trash2 size={16} /> 삭제</button>
                    </div>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AssetManager;
