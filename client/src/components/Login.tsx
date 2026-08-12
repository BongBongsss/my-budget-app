import React, { useState } from 'react';
import api from '../api';
import { Wallet, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'viewer') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<'admin' | 'viewer'>('admin');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { username, password, rememberMe });
      onLogin(res.data.role);
    } catch (err) {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Wallet size={32} />
          </div>
          <h2>효굥봉 가계부</h2>
          <p>내 손안의 똑똑한 가계부 관리자</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="flex items-center gap-1"><User size={14}/> User ID</label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value as 'admin' | 'viewer')}
              className="login-input"
              required
            >
              <option value="admin">Admin (관리자)</option>
              <option value="viewer">Viewer (조회용)</option>
            </select>
          </div>
          <label className="login-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> 자동 로그인 유지 <span>(개인 기기에서만)</span></label>
          <div className="form-group">
            <label className="flex items-center gap-1"><Lock size={14}/> Password</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            로그인하기
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          &copy; 2026 효굥봉 가계부. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
