import React, { useState } from 'react';
import { X } from 'lucide-react';
import CategorySettings from './CategorySettings';
import ChangePassword from './ChangePassword';
import CategoryGroupSettings from './CategoryGroupSettings';
import PaymentRuleSettings from './PaymentRuleSettings';
import AssetTypeSettings from './AssetTypeSettings';
import RecurringSettings from './RecurringSettings';
import RuleManager from './RuleManager';
import IgnoredRulesManager from './IgnoredRulesManager';
import { CategoryItem } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onRefresh: () => void;
  onAssetTypesChanged?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, categories, onRefresh, onAssetTypesChanged }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'group' | 'rule' | 'ignored' | 'assetType' | 'password'>('category');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: activeTab === 'group' ? '1350px' : '650px' }}>
        <div className="modal-header">
          <h3>설정</h3>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>
        <div className="tabs settings-tabs mb-4 border-b">
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'category' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('category')}>대분류 관리</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'group' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('group')}>상위 그룹 관리</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'rule' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('rule')}>자동 분류 규칙</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'ignored' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('ignored')}>추천 제외 목록</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'assetType' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('assetType')}>자산 유형</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'password' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('password')}>보안 · 데이터 정리</button>
        </div>
        {activeTab === 'category' && <CategorySettings categories={categories} onRefresh={onRefresh} />}
        {activeTab === 'group' && <CategoryGroupSettings categories={categories} onRefresh={onRefresh} />}
        {activeTab === 'rule' && <RuleManager categories={categories} onRefresh={onRefresh} />}
        {activeTab === 'ignored' && <IgnoredRulesManager />}
        {activeTab === 'assetType' && <AssetTypeSettings onChanged={() => { onAssetTypesChanged?.(); onRefresh(); }} />}
        {activeTab === 'password' && <ChangePassword onClose={onClose} />}
      </div>
    </div>
  );
};
export default SettingsModal;
