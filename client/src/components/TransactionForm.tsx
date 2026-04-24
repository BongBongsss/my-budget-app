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
    type: 'expense' as 'income' | 'expense' | 'recurring',
    vendor: '',
    amount: '',
    category: categories[0]?.name || '',
    memo: ''
  });

  // Vendor 입력 시 자동 카테고리 매칭
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
    }, 500); // 0.5초 디바운스 적용

    return () => clearTimeout(timer);
  }, [formData.vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        date: formData.date,
        type: formData.type === 'recurring' ? 'expense' : (formData.type as 'income' | 'expense'),
        vendor: formData.vendor,
        amount: parseFloat(formData.amount),
        category: formData.category,
        is_recurring: formData.type === 'recurring' ? 1 : 0,
        memo: formData.memo
      });
      setFormData({
        ...formData,
        vendor: '',
        amount: '',
        memo: ''
      });
      onSuccess();
    } catch (err) {
      alert('Error adding transaction');
    }
  };

  return (
    <div className="card-form">
      <h3>Add New Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-form">
          <div className="form-group">
            <label>Date</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.7rem', padding: '0 5px' }}
                onClick={() => setFormData({...formData, date: new Date().toISOString().split('T')[0]})}
              >
                Today
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense' | 'recurring'})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="recurring">Recurring (Fixed)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vendor / Source</label>
            <input 
              type="text" 
              placeholder="e.g. Starbucks, Salary"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount (₩)</label>
            <input 
              type="number" 
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Memo (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Lunch with friends"
              value={formData.memo}
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <PlusCircle className="mr-2" size={18} /> Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
