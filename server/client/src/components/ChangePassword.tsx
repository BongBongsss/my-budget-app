import React, { useState } from 'react';
import axios from 'axios';
import { cleanupTransactions } from '../api';
import { Database, ShieldCheck, RefreshCw } from 'lucide-react';

interface ChangePasswordProps {
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('https://my-budget-app-nwm8.onrender.com/api/change-password', { current, newPassword });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      onClose();
    } catch (err) {
      alert('비밀번호 변경 실패 (현재 비밀번호를 확인해 주세요)');
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('미확정 거래의 신규/중복 분류를 다시 계산하시겠습니까? (승인된 거래 기준으로 다시 나눕니다)')) return;
    
    setIsCleaning(true);
    try {
      const res = await cleanupTransactions();
      alert(`재분류 완료! (변경: ${res.data.updatedCount}건, 삭제: ${res.data.deletedCount}건)`);
      window.location.reload();
    } catch (err) {
      alert('재분류 중 오류가 발생했습니다.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="flex flex-column gap-6">
      <div className="mb-6">
        <h4 className="flex items-center gap-2 mb-4" style={{ margin: '0 0 15px 0' }}>
          <ShieldCheck size={20} /> Change Password
        </h4>
        <form onSubmit={handleSubmit} className="flex flex-column gap-3">
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>현재 비밀번호</label>
            <input 
              type="password" 
              value={current} 
              onChange={e => setCurrent(e.target.value)} 
              className="edit-input" 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>새 비밀번호</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="edit-input" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Update Password</button>
        </form>
      </div>

      <div className="mt-6 pt-6 border-t" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h4 className="flex items-center gap-2 mb-2 text-blue-600" style={{ color: '#2563eb', margin: '0 0 10px 0' }}>
          <Database size={20} /> 신규/중복 재분류
        </h4>
        <p className="text-sm text-gray-600 mb-4" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
          미확정 거래를 승인된 거래와 다시 비교해서 신규와 중복으로 다시 나눕니다.
          승인된 거래는 변경하지 않습니다.
        </p>
        <button 
          onClick={handleCleanup} 
          className="btn btn-secondary w-full flex justify-center gap-2"
          disabled={isCleaning}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <RefreshCw size={18} className={isCleaning ? 'animate-spin' : ''} />
          {isCleaning ? '재분류 중...' : '신규/중복 재분류'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
