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
    if (!window.confirm('기존 데이터의 중복을 체크하고 Hash를 생성하시겠습니까? (잠시 시간이 걸릴 수 있습니다)')) return;
    
    setIsCleaning(true);
    try {
      const res = await cleanupTransactions();
      alert(`정리 완료! (갱신: ${res.data.updatedCount}건, 중복 삭제: ${res.data.deletedCount}건)`);
      window.location.reload();
    } catch (err) {
      alert('데이터 정리 중 오류가 발생했습니다.');
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
          <Database size={20} /> Data Maintenance
        </h4>
        <p className="text-sm text-gray-600 mb-4" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
          기존 데이터의 중복 방지 지문(Hash)을 생성하고 중복된 내역을 정리합니다. 
          신규 내역과 기존 내역이 겹쳐 보일 때 실행해 주세요.
        </p>
        <button 
          onClick={handleCleanup} 
          className="btn btn-secondary w-full flex justify-center gap-2"
          disabled={isCleaning}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <RefreshCw size={18} className={isCleaning ? 'animate-spin' : ''} />
          {isCleaning ? '데이터 정리 중...' : '데이터 중복 정리 및 Hash 갱신'}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
