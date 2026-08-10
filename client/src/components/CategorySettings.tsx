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
      } catch (err: any) {
        console.error('Category deletion failed:', err);
        alert(`카테고리를 삭제하지 못했습니다.\n${err?.message || '서버 오류가 발생했습니다.'}`);
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
          placeholder="새 대분류 입력"
          className="edit-input"
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={18} className="mr-1" /> 추가
        </button>
      </form>

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
        <table className="category-table">
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: 'left' }}>대분류명</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>
                  <div className="category-name-cell">
                    <span>{cat.name}</span>
                  <button 
                    onClick={() => cat.id && handleDelete(cat.id)}
                    className="btn-icon delete"
                    title="삭제"
                    aria-label={`${cat.name} 삭제`}
                  >
                    <Trash2 size={16} />
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategorySettings;
