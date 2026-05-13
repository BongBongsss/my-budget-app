import React, { useState, useEffect } from 'react';
import { CategoryItem, updateCategoryBatchGroup } from '../api';
import { Layers, Folder, FolderPlus, Tag, GripVertical, Edit2, Check, X, Plus } from 'lucide-react';

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

  // 빈 그룹(아직 카테고리가 없는 그룹)을 관리하기 위한 상태
  const [emptyGroups, setEmptyGroups] = useState<string[]>([]);
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [tempGroupName, setTempGroupName] = useState('');

  // 그룹별로 카테고리 묶기
  const groupedCategories: Record<string, CategoryItem[]> = categories.reduce((acc, cat) => {
    const group = cat.groupName || '미분류';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, CategoryItem[]>);

  // 실제 데이터가 있는 그룹 + 사용자가 추가한 빈 그룹 합치기
  const allGroupNames = Array.from(new Set([...Object.keys(groupedCategories), ...emptyGroups]));

  // 정렬: 미분류 -> 나머지 이름순
  const sortedGroups = allGroupNames.sort((a, b) => {
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
      // 성공적으로 데이터가 이동되면 해당 이름은 더 이상 '빈 그룹' 상태가 아니어도 됨
      setEmptyGroups(prev => prev.filter(g => g !== groupName.trim()));
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

  const addNewGroupCard = () => {
    if (!tempGroupName.trim()) {
      setIsAddingNewGroup(false);
      return;
    }
    if (sortedGroups.includes(tempGroupName.trim())) {
      alert('이미 존재하는 그룹 이름입니다.');
      return;
    }
    setEmptyGroups(prev => [...prev, tempGroupName.trim()]);
    setTempGroupName('');
    setIsAddingNewGroup(false);
  };

  const startEditingGroup = (group: string) => {
    setEditingGroupName(group);
    setNewPasswordName(group);
  };

  const saveGroupName = async (oldGroup: string) => {
    const trimmedNew = newGroupName.trim();
    if (!trimmedNew || oldGroup === trimmedNew) {
      setEditingGroupName(null);
      return;
    }
    
    // 빈 그룹인 경우 이름만 변경
    if (emptyGroups.includes(oldGroup)) {
        setEmptyGroups(prev => prev.map(g => g === oldGroup ? trimmedNew : g));
        setEditingGroupName(null);
        return;
    }

    const categoryIds = groupedCategories[oldGroup]?.map(c => c.id!) || [];
    await handleApplyGroup(categoryIds, trimmedNew);
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
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h4 className="flex items-center gap-2 mb-1">
            <Folder size={20} className="text-blue-500" /> Category Grouping
            </h4>
            <p className="text-sm text-gray-600">
            대분류 태그를 드래그하여 옮기거나, 이름을 수정할 수 있습니다.
            </p>
        </div>
        <button 
            onClick={() => setIsAddingNewGroup(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
            <Plus size={16} style={{ marginRight: '4px' }} /> 새 그룹 추가
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '12px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxHeight: '480px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '15px' 
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
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
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
                    <input 
                      type="text" 
                      value={newGroupName} 
                      onChange={(e) => setNewPasswordName(e.target.value)}
                      autoFocus
                      style={{ fontSize: '0.75rem', padding: '2px 4px', border: '1px solid #3b82f6', borderRadius: '4px', width: '100%' }}
                      onKeyDown={(e) => e.key === 'Enter' && saveGroupName(group)}
                      onBlur={() => setEditingGroupName(null)}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontWeight: 'bold' }}>{group} ({groupedCategories[group]?.length || 0})</span>
                      {group !== '미분류' && <Edit2 size={10} onClick={() => startEditingGroup(group)} style={{ cursor: 'pointer', opacity: 0.5 }} />}
                    </div>
                  )}
                </h5>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {groupedCategories[group]?.map(cat => (
                  <div 
                    key={cat.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, cat.id!)}
                    onClick={() => toggleSelect(cat.id!)}
                    title={cat.name}
                    style={{ 
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      cursor: 'grab',
                      border: '1px solid',
                      whiteSpace: 'nowrap',
                      backgroundColor: selectedIds.includes(cat.id!) ? '#3b82f6' : '#fff',
                      color: selectedIds.includes(cat.id!) ? '#fff' : '#64748b',
                      borderColor: selectedIds.includes(cat.id!) ? '#2563eb' : '#e2e8f0',
                      transition: 'all 0.2s',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
                {(!groupedCategories[group] || groupedCategories[group].length === 0) && (
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '10px', textAlign: 'center', width: '100%' }}>
                        태그를 여기로 드래그하세요
                    </div>
                )}
              </div>
            </div>
          ))}

          {/* 새 그룹 추가 버튼 카드 */}
          {isAddingNewGroup ? (
            <div style={{ 
                backgroundColor: '#f0f9ff', 
                borderRadius: '10px', 
                padding: '12px', 
                border: '2px solid #3b82f6',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
            }}>
                <input 
                    type="text" 
                    placeholder="그룹명 입력" 
                    value={tempGroupName}
                    onChange={(e) => setTempGroupName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && addNewGroupCard()}
                    style={{ width: '100%', padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #3b82f6' }}
                />
                <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
                    <button onClick={addNewGroupCard} className="btn btn-primary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }}>추가</button>
                    <button onClick={() => setIsAddingNewGroup(false)} className="btn btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }}>취소</button>
                </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsAddingNewGroup(true)}
              style={{ 
                backgroundColor: 'transparent', 
                borderRadius: '10px', 
                padding: '12px', 
                border: '2px dashed #e2e8f0',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Plus size={32} />
              <span style={{ fontSize: '0.85rem', marginTop: '8px' }}>새 그룹 추가</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#fff', 
        border: '2px solid #3b82f6', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6' }}>{selectedIds.length}개 선택됨</div>
          <input 
            type="text" 
            list="existing-groups-list"
            value={targetGroupName} 
            onChange={(e) => setTargetGroupName(e.target.value)}
            placeholder="이동할 그룹명 입력"
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
          <datalist id="existing-groups-list">
            {sortedGroups.filter(g => g !== '미분류').map(g => <option key={g} value={g} />)}
          </datalist>
        </div>
        <button 
          onClick={() => handleApplyGroup(selectedIds, targetGroupName)} 
          className="btn btn-primary"
          style={{ height: '40px', padding: '0 20px' }}
          disabled={isUpdating || selectedIds.length === 0 || !targetGroupName.trim()}
        >
          적용
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
