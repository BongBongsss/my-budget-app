import React, { useState, useEffect } from 'react';
import { RecurringTransaction, CategoryItem, getRecurring, addRecurring, deleteRecurring } from '../api';
import { Plus, Trash2 } from 'lucide-react';

interface RecurringSettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const RecurringSettings: React.FC<RecurringSettingsProps> = ({ categories, onRefresh }) => {
  const [list, setList] = useState<RecurringTransaction[]>([]);
  const [formData, setFormData] = useState({ vendor: '', amount: '', category: categories[0]?.name || '', day_of_month: '1' });

  useEffect(() => {
    getRecurring().then(res => setList(res.data));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRecurring({ ...formData, amount: parseFloat(formData.amount), day_of_month: parseInt(formData.day_of_month) });
    setFormData({ vendor: '', amount: '', category: categories[0]?.name || '', day_of_month: '1' });
    const res = await getRecurring();
    setList(res.data);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteRecurring(id);
    const res = await getRecurring();
    setList(res.data);
    onRefresh();
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-2 mb-6">
        <input type="text" placeholder="Vendor" className="edit-input" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} required />
        <input type="number" placeholder="Amount" className="edit-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
        <select className="edit-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input type="number" min="1" max="28" className="edit-input" value={formData.day_of_month} onChange={e => setFormData({...formData, day_of_month: e.target.value})} />
        <button type="submit" className="btn btn-primary col-span-2"><Plus size={18} className="mr-2"/>Add</button>
      </form>
      <table className="category-table">
        <tbody>
          {list.map(item => (
            <tr key={item.id}>
              <td>{item.vendor}</td>
              <td>{item.amount.toLocaleString()}</td>
              <td>{item.day_of_month}</td>
              <td><button className="btn-icon delete" onClick={() => item.id && handleDelete(item.id)}><Trash2 size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringSettings;
