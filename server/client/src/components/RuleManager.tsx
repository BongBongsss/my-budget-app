import React, { useState, useEffect } from 'react';
import { CategoryRule, getRules, deleteRule, updateRule, CategoryItem } from '../api';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface RuleManagerProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ categories, onRefresh }) => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryRule>({ keyword: '', assigned_category: '' });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await getRules();
      setRules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateRule(id, editForm);
      setEditingId(null);
      fetchRules();
      onRefresh();
    } catch (err) {
      alert('규칙 수정 실패');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteRule(id);
      fetchRules();
      onRefresh();
    }
  };

  return (
    <div className="rule-manager" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="w-full border-collapse text-sm">
        <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
          <tr className="border-b">
            <th className="p-2 text-left">가맹점 키워드</th>
            <th className="p-2 text-left">카테고리</th>
            <th className="p-2 text-center" style={{ width: '100px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id} className="border-b hover:bg-gray-50">
              {editingId === rule.id ? (
                <>
                  <td className="p-2">
                    <input className="w-full p-1 border rounded" value={editForm.keyword} onChange={e => setEditForm({...editForm, keyword: e.target.value})} />
                  </td>
                  <td className="p-2">
                    <select className="w-full p-1 border rounded" value={editForm.assigned_category} onChange={e => setEditForm({...editForm, assigned_category: e.target.value})}>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => handleUpdate(rule.id!)} className="btn-icon text-green-600"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="btn-icon text-red-600"><X size={16} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{rule.keyword}</td>
                  <td className="p-2">{rule.assigned_category}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => { setEditingId(rule.id!); setEditForm(rule); }} className="btn-icon mr-2"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(rule.id!)} className="btn-icon text-red-600"><Trash2 size={16} /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RuleManager;
