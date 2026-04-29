import React, { useState } from 'react';
import { X } from 'lucide-react';
import CategorySettings from './CategorySettings';
import ChangePassword from './ChangePassword';
import AutoCategorySettings from './AutoCategorySettings';
import CategoryGroupSettings from './CategoryGroupSettings';
import PaymentRuleSettings from './PaymentRuleSettings';
import { CategoryItem } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onRefresh: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, categories, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'auto' | 'group' | 'payment' | 'password'>('category');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: activeTab === 'group' ? '1350px' : '650px' }}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>
        <div className="tabs mb-4 flex border-b overflow-x-auto">
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'category' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('category')}>Categories</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'auto' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('auto')}>Auto Rules</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'group' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('group')}>Grouping</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'payment' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('payment')}>Payment Rules</button>
          <button className={`px-4 py-2 whitespace-nowrap ${activeTab === 'password' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('password')}>Security</button>
        </div>
        {activeTab === 'category' && <CategorySettings categories={categories} onRefresh={onRefresh} />}
        {activeTab === 'auto' && <AutoCategorySettings categories={categories} />}
        {activeTab === 'group' && <CategoryGroupSettings categories={categories} onRefresh={onRefresh} />}
        {activeTab === 'payment' && <PaymentRuleSettings onRefresh={onRefresh} />}
        {activeTab === 'password' && <ChangePassword onClose={onClose} />}
      </div>
    </div>
  );
};

export default SettingsModal;
