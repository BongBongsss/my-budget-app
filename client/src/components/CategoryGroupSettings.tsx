import React, { useState } from 'react';
import { CategoryItem, updateCategoryBatchGroup } from '../api';
import { Layers, Folder, FolderPlus, Tag, GripVertical, Edit2, Check, X } from 'lucide-react';

interface CategoryGroupSettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ categories, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetGroupName, setTargetGroupName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [newGroupName, setNewPasswordName] = useState('');

  const groupedCategories: Record<string, CategoryItem[]> = categories.reduce((acc, cat) => {
    const group = cat.groupName || '미분류';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, CategoryItem[]>);

  const sortedGroups = Object.keys(groupedCategories).sort((a, b) => {
    if (a === '미분류') return -1;
    if (b === '미분류') return 1;
    return a.localeCompare(b);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleApplyGroup = async (ids: string[], groupName: string) => {
    if (ids.length === 0 || (!groupName.trim() && groupName !== '')) return;
    setIsUpdating(true);
    try {
      await updateCategoryBatchGroup(ids, groupName.trim());
      onRefresh();
    } catch (err) {
      alert('그룹 설정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
      setSelectedIds([]);
      setTargetGroupName('');
      setEditingGroupName(null);
    }
  };

  const startEditingGroup = (group: string) => {
    setEditingGroupName(group);
    setNewPasswordName(group);
  };

  const saveGroupName = async (oldGroup: string) => {
    if (!newGroupName.trim() || oldGroup === newGroupName.trim()) {
      setEditingGroupName(null);
      return;
    }
    const categoryIds = groupedCategories[oldGroup].map(c => c.id!);
    await handleApplyGroup(categoryIds, newGroupName.trim());
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.setData('categoryId', id);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent, targetGroup: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('categoryId') || draggedCategoryId;
    if (!id) return;
    const movingIds = selectedIds.includes(id) ? selectedIds : [id];
    const finalGroupName = targetGroup === '미분류' ? '' : targetGroup;
    handleApplyGroup(movingIds, finalGroupName);
    setDraggedCategoryId(null);
  };

  return (
    <div className="category-group-settings" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 className="flex items-center gap-2 mb-2">
          <Folder size={20} className="text-blue-500" /> Category Grouping
        </h4>
        <p className="text-sm text-gray-600">
          대분류 태그를 드래그하여 옮기거나, 이름을 수정할 수 있습니다. (태그 클릭 시 다중 선택 가능)
        </p>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxHeight: '450px'
      }}>
        {/* 요청: 최상위 카드 한 행에 4개 배치 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '12px' 
        }}>
          {sortedGroups.map(group => (
            <div 
              key={group} 
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, group)}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: group === '미분류' ? '1px dashed #f87171' : '1px solid #e2e8f0',
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <h5 style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: group === '미분류' ? '#ef4444' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FolderPlus size={14} />
                  {editingGroupName === group ? (
                    <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
                      <input 
                        type="text" 
                        value={newGroupName} 
                        onChange={(e) => setNewPasswordName(e.target.value)}
                        autoFocus
                        style={{ fontSize: '0.75rem', padding: '1px 4px', border: '1px solid #3b82f6', borderRadius: '4px', width: '100%' }}
                        onKeyDown={(e) => e.key === 'Enter' && saveGroupName(group)}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group} ({groupedCategories[group].length})</span>
                      {group !== '미분류' && <Edit2 size={10} onClick={() => startEditingGroup(group)} style={{ cursor: 'pointer', opacity: 0.5 }} />}
                    </div>
                  )}
                </h5>
              </div>
              
              {/* 요청: 내부 태그 한 행에 3개씩 정렬 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '6px' 
              }}>
                {groupedCategories[group].map(cat => (
                  <div 
                    key={cat.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, cat.id!)}
                    onClick={() => toggleSelect(cat.id!)}
                    title={cat.name}
                    style={{ 
                      padding: '4px 2px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      cursor: 'grab',
                      textAlign: 'center',
                      border: '1px solid',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      backgroundColor: selectedIds.includes(cat.id!) ? '#3b82f6' : '#f9fafb',
                      color: selectedIds.includes(cat.id!) ? '#fff' : '#475569',
                      borderColor: selectedIds.includes(cat.id!) ? '#2563eb' : '#e5e7eb'
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '15px', 
        padding: '12px', 
        backgroundColor: '#fff', 
        border: '2px solid #3b82f6', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6' }}>{selectedIds.length}개 선택됨</div>
          <input 
            type="text" 
            list="existing-groups-list"
            value={targetGroupName} 
            onChange={(e) => setTargetGroupName(e.target.value)}
            placeholder="이동할 그룹명 입력"
            style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          />
          <datalist id="existing-groups-list">
            {sortedGroups.filter(g => g !== '미분류').map(g => <option key={g} value={g} />)}
          </datalist>
        </div>
        <button 
          onClick={() => handleApplyGroup(selectedIds, targetGroupName)} 
          className="btn btn-primary"
          style={{ height: '36px', padding: '0 15px', fontSize: '0.85rem' }}
          disabled={isUpdating || selectedIds.length === 0 || !targetGroupName.trim()}
        >
          적용
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
