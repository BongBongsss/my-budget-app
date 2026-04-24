import React, { useState } from 'react';
import { X } from 'lucide-react';
import CategorySettings from './CategorySettings';
import ChangePassword from './ChangePassword';
import { CategoryItem } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onRefresh: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, categories, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'password'>('category');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Settings</h3>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>
        <div className="tabs mb-4 flex border-b">
          <button className={`px-4 py-2 ${activeTab === 'category' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('category')}>Categories</button>
          <button className={`px-4 py-2 ${activeTab === 'password' ? 'border-b-2 border-blue-500 font-bold' : ''}`} onClick={() => setActiveTab('password')}>Security</button>
        </div>
        {activeTab === 'category' ? (
          <CategorySettings categories={categories} onRefresh={onRefresh} />
        ) : (
          <ChangePassword onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
