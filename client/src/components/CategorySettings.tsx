import React, { useState } from 'react';
import { CategoryItem, addCategory, deleteCategory } from '../api';
import { Plus, Trash2 } from 'lucide-react';

interface CategorySettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, onRefresh }) => {
  const [newName, setNewName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addCategory({ name: newName.trim() });
      setNewName('');
      onRefresh();
    } catch (err) {
      alert('Error adding category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        onRefresh();
      } catch (err) {
        alert('Error deleting category');
      }
    }
  };

  return (
    <div className="category-settings">
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new category..."
          className="edit-input"
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={18} className="mr-1" /> Add
        </button>
      </form>

      <table className="category-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Category Name</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => cat.id && handleDelete(cat.id)}
                  className="btn-icon delete"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategorySettings;
