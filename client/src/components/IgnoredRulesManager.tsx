import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const API_BASE = '/api';

interface IgnoredRule {
  id: string;
  keyword: string;
}

const IgnoredRulesManager: React.FC = () => {
  const [rules, setRules] = useState<IgnoredRule[]>([]);

  useEffect(() => {
    fetchIgnoredRules();
  }, []);

  const fetchIgnoredRules = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ignored-rules`);
      setRules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 규칙을 다시 추천 목록에 포함하시겠습니까?')) {
      await axios.delete(`${API_BASE}/ignored-rules/${id}`);
      fetchIgnoredRules();
    }
  };

  return (
    <div className="ignored-rules-manager" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="w-full border-collapse text-sm">
        <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
          <tr className="border-b">
            <th className="p-2 text-left">무시된 가맹점 키워드</th>
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

export default IgnoredRulesManager;
