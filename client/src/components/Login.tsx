import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('https://my-budget-app-nwm8.onrender.com/api/login', { password }, { withCredentials: true });
      onLogin();
    } catch (err) {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card-form" style={{ width: '300px' }}>
        <h3>로그인</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="edit-input mb-2"
          />
          <button type="submit" className="btn btn-primary w-full">확인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
