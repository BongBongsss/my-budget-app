import React, { useState } from 'react';
import { CategoryItem, updateCategoryBatchGroup } from '../api';
import { Layers, Folder, FolderPlus, Tag, GripVertical } from 'lucide-react';

interface CategoryGroupSettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ categories, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetGroupName, setTargetGroupName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  // 그룹별로 카테고리 묶기
  const groupedCategories: Record<string, CategoryItem[]> = categories.reduce((acc, cat) => {
    const group = cat.groupName || '미분류';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, CategoryItem[]>);

  // 정렬: 미분류가 가장 먼저, 나머지는 이름순
  const sortedGroups = Object.keys(groupedCategories).sort((a, b) => {
    if (a === '미분류') return -1;
    if (b === '미분류') return 1;
    return a.localeCompare(b);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleApplyGroup = async (ids: string[], groupName: string) => {
    if (ids.length === 0 || !groupName.trim()) return;

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
    }
  };

  // Drag & Drop 핸들러
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.setData('categoryId', id);
    // 선택된 항목 중 하나를 드래그하는 경우, 선택된 모든 항목을 이동 대상으로 간주할 준비
    if (!selectedIds.includes(id)) {
        // 드래그하는 항목이 선택되지 않았다면 해당 항목만 단독으로 드래그
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // 드롭 허용
  };

  const onDrop = (e: React.DragEvent, targetGroup: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('categoryId') || draggedCategoryId;
    if (!id) return;

    // 만약 드래그한 항목이 선택된 항목들 중 하나라면, 선택된 전체를 이동
    const movingIds = selectedIds.includes(id) ? selectedIds : [id];
    
    const finalGroupName = targetGroup === '미분류' ? '' : targetGroup;
    handleApplyGroup(movingIds, finalGroupName);
    setDraggedCategoryId(null);
  };

  return (
    <div className="category-group-settings" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 className="flex items-center gap-2 mb-2">
          <Folder size={20} className="text-blue-500" /> Category Grouping (Drag & Drop)
        </h4>
        <p className="text-sm text-gray-600">
          대분류 태그를 원하는 그룹 카드로 **드래그**하여 옮길 수 있습니다. 
          여러 개를 한꺼번에 옮기려면 먼저 클릭하여 선택한 후 드래그하세요.
        </p>
      </div>

      {/* 카드형 그룹 목록 영역 */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxHeight: '400px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {sortedGroups.map(group => (
            <div 
              key={group} 
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, group)}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '15px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: group === '미분류' ? '1px dashed #f87171' : '1px solid #e2e8f0',
                minHeight: '100px',
                transition: 'background-color 0.2s'
              }}
              onDragEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
              onDragLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <h5 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '0.9rem', 
                color: group === '미분류' ? '#ef4444' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FolderPlus size={16} /> {group}
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8' }}>
                  ({groupedCategories[group].length})
                </span>
              </h5>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {groupedCategories[group].map(cat => (
                  <div 
                    key={cat.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, cat.id!)}
                    onClick={() => toggleSelect(cat.id!)}
                    style={{ 
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid',
                      transition: 'all 0.2s',
                      backgroundColor: selectedIds.includes(cat.id!) ? '#3b82f6' : '#fff',
                      color: selectedIds.includes(cat.id!) ? '#fff' : '#64748b',
                      borderColor: selectedIds.includes(cat.id!) ? '#2563eb' : '#e2e8f0',
                      opacity: isUpdating && (selectedIds.includes(cat.id!) || draggedCategoryId === cat.id) ? 0.5 : 1
                    }}
                  >
                    <Tag size={12} />
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 고정 액션바 (선택 일괄 변경용으로 유지) */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff', 
        border: '2px solid #3b82f6', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
            {selectedIds.length}개 카테고리 선택됨
          </div>
          <input 
            type="text" 
            list="existing-groups-list"
            value={targetGroupName} 
            onChange={(e) => setTargetGroupName(e.target.value)}
            placeholder="직접 그룹명 입력 (드래그 대신 사용 가능)"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem'
            }}
          />
          <datalist id="existing-groups-list">
            {sortedGroups.filter(g => g !== '미분류').map(g => <option key={g} value={g} />)}
          </datalist>
        </div>
        
        <button 
          onClick={() => handleApplyGroup(selectedIds, targetGroupName)} 
          className="btn btn-primary"
          style={{ height: '42px', padding: '0 20px' }}
          disabled={isUpdating || selectedIds.length === 0 || !targetGroupName.trim()}
        >
          <Layers size={18} style={{ marginRight: '8px' }} />
          {isUpdating ? '처리 중...' : '그룹 변경 적용'}
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
