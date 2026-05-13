import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { getAssets, addAsset, updateAsset, deleteAsset, Asset } from '../api';

const AssetSettings: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
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
      alert('Failed to add asset');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateAsset(id, editForm);
      setEditingId(null);
      fetchAssets();
    } catch (err) {
      alert('Failed to update asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      fetchAssets();
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const startEdit = (asset: Asset) => {
    setEditingId(asset.id!);
    setEditForm(asset);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold mb-2">새 자산 추가</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="자산명 (예: 국민은행)"
            className="input-field"
            value={newAsset.name}
            onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
          />
          <select
            className="input-field"
            value={newAsset.type}
            onChange={e => setNewAsset({ ...newAsset, type: e.target.value as any })}
          >
            <option value="bank">예적금</option>
            <option value="cash">현금</option>
            <option value="stock">주식</option>
            <option value="realestate">부동산</option>
            <option value="liability">부채</option>
            <option value="other">기타</option>
          </select>
          <input
            type="number"
            placeholder="잔액"
            className="input-field"
            value={newAsset.balance}
            onChange={e => setNewAsset({ ...newAsset, balance: parseFloat(e.target.value) })}
          />
          <button onClick={handleAdd} className="btn-primary flex items-center justify-center gap-1">
            <Plus size={16} /> 추가
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">자산명</th>
              <th className="p-2 text-left">유형</th>
              <th className="p-2 text-right">잔액</th>
              <th className="p-2 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id} className="border-b">
                <td className="p-2">
                  {editingId === asset.id ? (
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : asset.name}
                </td>
                <td className="p-2">
                  {editingId === asset.id ? (
                    <select
                      className="input-field text-sm"
                      value={editForm.type}
                      onChange={e => setEditForm({ ...editForm, type: e.target.value as any })}
                    >
                      <option value="bank">예적금</option>
                      <option value="cash">현금</option>
                      <option value="stock">주식</option>
                      <option value="realestate">부동산</option>
                      <option value="liability">부채</option>
                      <option value="other">기타</option>
                    </select>
                  ) : asset.type}
                </td>
                <td className="p-2 text-right">
                  {editingId === asset.id ? (
                    <input
                      type="number"
                      className="input-field text-sm text-right"
                      value={editForm.balance}
                      onChange={e => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <span className={asset.type === 'liability' ? 'text-red-500' : ''}>
                      {asset.balance.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-1">
                    {editingId === asset.id ? (
                      <>
                        <button onClick={() => handleUpdate(asset.id!)} className="p-1 text-green-600"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(asset)} className="p-1 text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(asset.id!)} className="p-1 text-red-600"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetSettings;
