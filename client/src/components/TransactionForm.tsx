import React, { useState, useEffect } from 'react';
import { addTransaction, CategoryItem, autoCategorizeVendor } from '../api';
import { PlusCircle } from 'lucide-react';

interface TransactionFormProps {
  onSuccess: () => void;
  categories: CategoryItem[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: 'expense' as 'income' | 'expense',
    category: categories[0]?.name || '',
    subcategory: '',
    vendor: '',
    amount: '',
    currency: 'KRW',
    source: 'manual',
    memo: '',
    member: '효'
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.vendor.length >= 2) {
        try {
          const res = await autoCategorizeVendor(formData.vendor);
          if (res.data.category !== '기타') {
            setFormData(prev => ({ ...prev, category: res.data.category }));
          }
        } catch (err) {
          console.error('Auto categorization failed');
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData(prev => ({ ...prev, vendor: '', amount: '', memo: '', subcategory: '' }));
      onSuccess();
    } catch (err) {
      alert('Error adding transaction');
    }
  };

  return (
    <div className="card-form">
      <h3>Add New Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <div className="form-group"><label>날짜</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required/></div>
          <div className="form-group"><label>시간</label><input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} /></div>
          <div className="form-group"><label>효/굥</label><select value={formData.member} onChange={(e) => setFormData({...formData, member: e.target.value})}><option value="효">효</option><option value="굥">굥</option></select></div>
          <div className="form-group"><label>타입</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}><option value="expense">지출</option><option value="income">수입</option><option value="exclude">미반영</option></select></div>
          <div className="form-group"><label>대분류</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></div>
          <div className="form-group"><label>소분류</label><input type="text" value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} /></div>
          <div className="form-group"><label>내용</label><input type="text" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} required/></div>
          <div className="form-group"><label>금액</label><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required/></div>
          <div className="form-group"><label>화폐</label><input type="text" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} /></div>
          <div className="form-group"><label>결제수단</label><input type="text" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>메모</label><input type="text" value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} /></div>
        </div>
        <div className="form-actions"><button type="submit" className="btn btn-primary"><PlusCircle className="mr-2" size={18} /> Add</button></div>
      </form>
    </div>
  );
};

export default TransactionForm;
