import React, { useState } from 'react';
import axios from 'axios';
import { Wallet } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('https://my-budget-app-nwm8.onrender.com/api/login', { password });
      onLogin();
    } catch (err) {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Wallet size={32} />
          </div>
          <h2>Smart Budget Manager</h2>
          <p>내 손안의 똑똑한 가계부 관리자</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Master Password</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoFocus
              required
            />
          </div>
          <button type="submit" className="login-btn">
            로그인하기
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          &copy; 2026 Smart Budget Manager. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
