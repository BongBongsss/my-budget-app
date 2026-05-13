import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const API_BASE = '/api';

interface ExclusionRule {
  id: string;
  keyword: string;
}

const ExclusionRulesManager: React.FC = () => {
  const [rules, setRules] = useState<ExclusionRule[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    fetchExclusionRules();
  }, []);

  const fetchExclusionRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/exclusion-rules`);
      setRules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!newKeyword) return;
    await axios.post(`${API_BASE}/exclusion-rules`, { keyword: newKeyword });
    setNewKeyword('');
    fetchExclusionRules();
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 규칙을 삭제하시겠습니까?')) {
      await axios.delete(`${API_BASE}/exclusion-rules/${id}`);
      fetchExclusionRules();
    }
  };

  return (
    <div className="exclusion-rules-manager" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <div className="mb-4 flex gap-2">
        <input className="flex-1 p-1 border rounded text-sm" placeholder="제외할 가맹점 키워드" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} />
        <button onClick={handleAdd} className="btn btn-primary text-sm px-3">추가</button>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
          <tr className="border-b">
            <th className="p-2 text-left">제외 가맹점 키워드</th>
            <th className="p-2 text-center" style={{ width: '100px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{rule.keyword}</td>
              <td className="p-2 text-center">
                <button onClick={() => handleDelete(rule.id)} className="btn-icon text-red-600"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExclusionRulesManager;
