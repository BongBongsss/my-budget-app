import React, { useState } from 'react';
import { CategoryItem, updateCategoryBatchGroup } from '../api';
import { Layers, Folder, FolderPlus, Tag, ChevronRight } from 'lucide-react';

interface CategoryGroupSettingsProps {
  categories: CategoryItem[];
  onRefresh: () => void;
}

const CategoryGroupSettings: React.FC<CategoryGroupSettingsProps> = ({ categories, onRefresh }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetGroupName, setTargetGroupName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleApplyGroup = async () => {
    if (selectedIds.length === 0 || !targetGroupName.trim()) {
      alert('변경할 카테고리를 선택하고 그룹 이름을 입력해 주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateCategoryBatchGroup(selectedIds, targetGroupName.trim());
      alert('그룹 설정이 완료되었습니다!');
      setSelectedIds([]);
      setTargetGroupName('');
      onRefresh();
    } catch (err) {
      alert('그룹 설정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="category-group-settings" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 className="flex items-center gap-2 mb-2">
          <Folder size={20} className="text-blue-500" /> Category Grouping
        </h4>
        <p className="text-sm text-gray-600">
          대분류들을 상위 그룹(식비, 주거비 등)으로 묶어 관리할 수 있습니다. 
          태그를 클릭하여 선택한 후 하단에서 그룹을 지정하세요.
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
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '15px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: group === '미분류' ? '1px dashed #f87171' : '1px solid #e2e8f0'
              }}
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
                    onClick={() => toggleSelect(cat.id!)}
                    style={{ 
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid',
                      transition: 'all 0.2s',
                      backgroundColor: selectedIds.includes(cat.id!) ? '#3b82f6' : '#fff',
                      color: selectedIds.includes(cat.id!) ? '#fff' : '#64748b',
                      borderColor: selectedIds.includes(cat.id!) ? '#2563eb' : '#e2e8f0'
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

      {/* 하단 고정 액션바 */}
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
            placeholder="이동할 그룹명 입력 또는 선택"
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
          onClick={handleApplyGroup} 
          className="btn btn-primary"
          style={{ height: '42px', padding: '0 20px' }}
          disabled={isUpdating || selectedIds.length === 0}
        >
          <Layers size={18} style={{ marginRight: '8px' }} />
          {isUpdating ? '처리 중...' : '그룹 변경 적용'}
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupSettings;
