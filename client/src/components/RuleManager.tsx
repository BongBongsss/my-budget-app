import React, { useState, useEffect } from 'react';
import { CategoryRule, getRules, deleteRule, updateRule, CategoryItem, getRuleReviewCandidates, RuleReviewCandidate } from '../api';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface RuleManagerProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const RuleManager: React.FC<RuleManagerProps> = ({ categories, onRefresh }) => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryRule>({ keyword: '', assigned_category: '' });
  const [reviewCandidates, setReviewCandidates] = useState<RuleReviewCandidate[]>([]);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const [res, reviewRes] = await Promise.all([getRules(), getRuleReviewCandidates()]);
      setRules(res.data);
      setReviewCandidates(reviewRes.data);
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
      {reviewCandidates.length > 0 && <section className="rule-review-list">
        <h4>규칙 재검토</h4>
        {reviewCandidates.map((candidate) => <div className="rule-review-card" key={candidate.id}>
          <strong>{candidate.keyword}</strong>
          <p>현재 {candidate.assignedCategory} · 최근 수동 수정 {candidate.totalOccurrences}건 중 {candidate.occurrenceCount}건이 {candidate.suggestedCategory} ({candidate.confidence}%)</p>
          <button className="btn btn-primary" onClick={() => void updateRule(candidate.id, { keyword: candidate.keyword, assigned_category: candidate.suggestedCategory }).then(fetchRules).then(onRefresh)}>규칙 변경</button>
        </div>)}
      </section>}
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
