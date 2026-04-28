import React, { useState, useEffect } from 'react';
import { getPaymentRules, addPaymentRule, deletePaymentRule, PaymentRule } from '../api';
import { Trash2, PlusCircle } from 'lucide-react';

const PaymentRuleSettings: React.FC = () => {
  const [rules, setRules] = useState<PaymentRule[]>([]);
  const [keyword, setKeyword] = useState('');
  const [paymentType, setPaymentType] = useState<'card' | 'transfer'>('card');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h4>Payment Classification Rules</h4>
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

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', border: '1px solid #eee', borderRadius: '8px' }}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentRuleSettings;
