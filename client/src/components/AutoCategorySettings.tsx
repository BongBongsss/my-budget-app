import React, { useState, useEffect } from 'react';
import { getRules, addRule, deleteRule, CategoryRule, CategoryItem } from '../api';
import { Trash2, PlusCircle } from 'lucide-react';

interface AutoCategorySettingsProps {
  categories: CategoryItem[];
}

const AutoCategorySettings: React.FC<AutoCategorySettingsProps> = ({ categories }) => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [keyword, setKeyword] = useState('');
  const [assignedCategory, setAssignedCategory] = useState('');

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
    try {
      await deleteRule(id);
      fetchRules();
    } catch (err) {
      alert('Error deleting rule');
    }
  };

  return (
    <div>
      <h4>Automatic Category Rules</h4>
      <p className="text-sm text-gray-600 mb-4">
        Assign categories automatically based on keywords found in the vendor name.
      </p>

      <form onSubmit={handleAddRule} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Keyword (e.g. Coupang)"
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

      <div className="max-h-60 overflow-y-auto">
        <table className="category-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.keyword}</td>
                <td>{rule.assigned_category}</td>
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

export default AutoCategorySettings;
