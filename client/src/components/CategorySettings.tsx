import React, { useState } from 'react';
import { CategoryItem, addCategory, deleteCategory, updateCategory } from '../api';
import { Check, Edit3, Plus, Trash2, X } from 'lucide-react';

interface CategorySettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, onRefresh }) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const startEditing = (category: CategoryItem) => {
    setEditingId(category.id || null);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRename = async (category: CategoryItem) => {
    const name = editingName.trim();
    if (!category.id || !name) return;
    if (name === category.name) {
      cancelEditing();
      return;
    }

    try {
      setIsSaving(true);
      await updateCategory(category.id, name);
      cancelEditing();
      onRefresh();
    } catch (err: any) {
      alert(err?.message || '대분류명을 수정하지 못했습니다.');
    } finally {
      setIsSaving(false);
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
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') void handleRename(cat);
                          if (event.key === 'Escape') cancelEditing();
                        }}
                        className="edit-input"
                        aria-label={`${cat.name} 대분류명 수정`}
                      />
                    ) : <span>{cat.name}</span>}
                    {editingId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleRename(cat)}
                          className="btn-icon edit"
                          title="저장"
                          aria-label={`${cat.name} 수정 저장`}
                          disabled={isSaving}
                        >
                          <Check size={16} />
                        </button>
                        <button type="button" onClick={cancelEditing} className="btn-icon delete" title="취소" aria-label={`${cat.name} 수정 취소`} disabled={isSaving}>
                          <X size={16} />
                        </button>
                      </>
                    ) : <>
                      <button
                        type="button"
                        onClick={() => startEditing(cat)}
                        className="btn-icon edit"
                        title="수정"
                        aria-label={`${cat.name} 수정`}
                      >
                        <Edit3 size={16} />
                      </button>
                    <button
                    type="button"
                    onClick={() => cat.id && handleDelete(cat.id)}
                    className="btn-icon delete"
                    title="삭제"
                    aria-label={`${cat.name} 삭제`}
                  >
                    <Trash2 size={16} />
                  </button>
                    </>}
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
