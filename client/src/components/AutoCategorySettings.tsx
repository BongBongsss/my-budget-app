import React, { useState, useEffect } from 'react';
import { getRules, addRule, deleteRule, CategoryRule, CategoryItem, applyAutoRules } from '../api';
import { Trash2, PlusCircle, Edit2, Check, X, Wand2 } from 'lucide-react';
import axios from 'axios';

interface AutoCategorySettingsProps {
  categories: CategoryItem[];
}

const AutoCategorySettings: React.FC<AutoCategorySettingsProps> = ({ categories }) => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [keyword, setKeyword] = useState('');
  const [assignedCategory, setAssignedCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CategoryRule>>({});
  const [isApplying, setIsApplying] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await getRules();
      setRules(res.data);
    } catch (err) {
      console.error('Error fetching rules:', err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !assignedCategory) return;
    try {
      await addRule({ keyword, assigned_category: assignedCategory });
      setKeyword('');
      setAssignedCategory('');
      fetchRules();
    } catch (err) {
      alert('Error adding rule (keyword might already exist)');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteRule(id);
      fetchRules();
    } catch (err) {
      alert('Error deleting rule');
    }
  };

  const handleApplyRules = async () => {
    if (!window.confirm('Apply all rules to existing "기타" transactions?')) return;
    setIsApplying(true);
    try {
      const res = await applyAutoRules();
      alert(`Successfully updated ${res.data.count} transactions!`);
      window.location.reload(); 
    } catch (err) {
      alert('Error applying rules');
    } finally {
      setIsApplying(false);
    }
  };

  const startEdit = (rule: CategoryRule) => {
    setEditingId(rule.id!);
    setEditValues(rule);
  };

  const handleUpdateRule = async (id: string) => {
    try {
      await axios.put(`https://my-budget-app-nwm8.onrender.com/api/rules/${id}`, editValues, { withCredentials: true });
      setEditingId(null);
      fetchRules();
    } catch (err) {
      alert('Error updating rule');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h4>Automatic Category Rules</h4>
      <p className="text-sm text-gray-600 mb-4">
        Assign categories automatically based on keywords.
      </p>

      <form onSubmit={handleAddRule} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="edit-input"
            required
          />
          <select
            value={assignedCategory}
            onChange={(e) => setAssignedCategory(e.target.value)}
            className="edit-input"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
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
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className={editingId === rule.id ? 'editing-row' : ''}>
                {editingId === rule.id ? (
                  <>
                    <td>
                      <input 
                        type="text" 
                        value={editValues.keyword || ''} 
                        onChange={e => setEditValues({...editValues, keyword: e.target.value})}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select 
                        value={editValues.assigned_category || ''} 
                        onChange={e => setEditValues({...editValues, assigned_category: e.target.value})}
                        className="edit-input"
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => handleUpdateRule(rule.id!)} className="btn-icon text-green-600"><Check size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="btn-icon text-red-600"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{rule.keyword}</td>
                    <td>{rule.assigned_category}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(rule)} className="btn-icon edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteRule(rule.id!)} className="btn-icon delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-end">
        <button 
          onClick={handleApplyRules} 
          className="btn btn-secondary"
          disabled={isApplying}
          style={{ fontSize: '0.85rem', gap: '8px' }}
        >
          {isApplying ? (
            <>Processing...</>
          ) : (
            <>
              <Wand2 size={16} />
              Apply Rules to Existing "기타" Data
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AutoCategorySettings;
