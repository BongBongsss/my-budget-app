import React, { useState } from 'react';
import axios from 'axios';

interface ChangePasswordProps {
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose }) => {
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('https://my-budget-app-nwm8.onrender.com/api/change-password', { current, newPassword });
      alert('비밀번호가 변경되었습니다.');
      onClose();
    } catch (err) {
      alert('비밀번호 변경 실패 (현재 비밀번호 확인 필요)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input 
        type="password" 
        placeholder="현재 비밀번호" 
        value={current}
        onChange={e => setCurrent(e.target.value)}
        className="edit-input mb-2"
        required
      />
      <input 
        type="password" 
        placeholder="새 비밀번호" 
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        className="edit-input mb-2"
        required
      />
      <button type="submit" className="btn btn-primary w-full">변경</button>
    </form>
  );
};

export default ChangePassword;
