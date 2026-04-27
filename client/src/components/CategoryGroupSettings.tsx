import React, { useState } from 'react';
import { CategoryItem, updateCategoryBatchGroup } from '../api';
import { Layers, CheckCircle } from 'lucide-react';

interface CategoryGroupSettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ categories, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetGroupName, setTargetGroupName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 현재 등록된 유니크한 그룹 이름들 추출
  const existingGroups = Array.from(new Set(categories.map(c => c.groupName).filter(Boolean)));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleApplyGroup = async () => {
    if (selectedIds.length === 0 || !targetGroupName.trim()) {
      alert('Select categories and enter a group name.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateCategoryBatchGroup(selectedIds, targetGroupName.trim());
      alert('Successfully grouped categories!');
      setSelectedIds([]);
      setTargetGroupName('');
      onRefresh();
    } catch (err) {
      alert('Error grouping categories');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="category-group-settings">
      <h4>Group Categories</h4>
      <p className="text-sm text-gray-600 mb-4">
        Select multiple categories and assign them to a single parent group.
      </p>

      <div className="flex gap-2 mb-6">
        <input 
          type="text" 
          list="existing-groups"
          value={targetGroupName} 
          onChange={(e) => setTargetGroupName(e.target.value)}
          placeholder="Enter Group Name (e.g. 식비)"
          className="edit-input"
        />
        <datalist id="existing-groups">
          {existingGroups.map(g => <option key={g} value={g!} />)}
        </datalist>
        <button 
          onClick={handleApplyGroup} 
          className="btn btn-primary"
          disabled={isUpdating || selectedIds.length === 0}
        >
          <Layers size={18} className="mr-1" /> {isUpdating ? 'Updating...' : 'Group Selected'}
        </button>
      </div>

      <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
        <table className="category-table">
          <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedIds(e.target.checked ? categories.map(c => c.id!) : [])}
                  checked={selectedIds.length === categories.length && categories.length > 0}
                />
              </th>
              <th>Category Name (대분류)</th>
              <th>Current Group (상위 그룹)</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr 
                key={cat.id} 
                className={selectedIds.includes(cat.id!) ? 'editing-row' : ''}
                onClick={() => toggleSelect(cat.id!)}
                style={{ cursor: 'pointer' }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(cat.id!)} 
                    onChange={() => toggleSelect(cat.id!)}
                  />
                </td>
                <td>{cat.name}</td>
                <td>
                  <span className="badge-type" style={{ background: '#e0f2fe', color: '#075985', textTransform: 'none' }}>
                    {cat.groupName || '기타'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-sm text-blue-600 font-bold">
        {selectedIds.length} categories selected.
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
