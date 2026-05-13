import React, { useState, useEffect } from 'react';
import { getPaymentRules, addPaymentRule, deletePaymentRule, applyPaymentRules, PaymentRule } from '../api';
import { Trash2, PlusCircle, RefreshCw } from 'lucide-react';

interface PaymentRuleSettingsProps {
  onRefresh?: () => void;
}

const PaymentRuleSettings: React.FC<PaymentRuleSettingsProps> = ({ onRefresh }) => {
  const [rules, setRules] = useState<PaymentRule[]>([]);
  const [keyword, setKeyword] = useState('');
  const [paymentType, setPaymentType] = useState<'card' | 'transfer'>('card');
  const [isApplying, setIsApplying] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await getPaymentRules();
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching payment rules:', err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;
    try {
      await addPaymentRule({ paymentType, keyword });
      setKeyword('');
      fetchRules();
    } catch (err) {
      alert('Error adding payment rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deletePaymentRule(id);
      fetchRules();
    } catch (err) {
      alert('Error deleting rule');
    }
  };

  const handleApplyRules = async () => {
    setIsApplying(true);
    try {
      const res = await applyPaymentRules();
      alert(`${res.data.updatedCount}개의 내역에 결제 규칙이 적용되었습니다.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error applying payment rules:', err);
      alert('결제 규칙 적용 중 오류가 발생했습니다.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h4 style={{ marginBottom: '8px' }}>Payment Classification Rules</h4>
      
      {/* 요청하신 위치: 제목 바로 아래 버튼 배치 */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleApplyRules} 
          className="btn btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.85rem', 
            padding: '6px 12px' 
          }}
          disabled={isApplying}
        >
          <RefreshCw size={16} className={isApplying ? 'animate-spin' : ''} />
          {isApplying ? '반영 중...' : '기존 내역에 결제 규칙 반영하기'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Define keywords to automatically classify transactions as 'Card' or 'Transfer'.
      </p>

      <form onSubmit={handleAddRule} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Keyword (e.g. 신한, 이체)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="edit-input"
            required
          />
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as 'card' | 'transfer')}
            className="edit-input"
          >
            <option value="card">카드결제</option>
            <option value="transfer">계좌이체</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <PlusCircle size={18} />
          </button>
        </div>
      </form>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', border: '1px solid #eee', borderRadius: '8px' }}>
        <table className="category-table">
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              <th>Keyword</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.keyword}</td>
                <td>{rule.paymentType === 'card' ? '카드결제' : '계좌이체'}</td>
                <td>
                  <button onClick={() => handleDeleteRule(rule.id!)} className="btn-icon delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  등록된 규칙이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentRuleSettings;
