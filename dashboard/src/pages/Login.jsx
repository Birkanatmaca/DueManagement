import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/login.scss';
import { backendLogin } from '../services/authServices';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const response = await backendLogin(email, password);
    // console.log('LOGIN RESPONSE:', response);
    if (response.success || (response.data && response.data.status === 'OK')) {
      const role = response.data?.response?.role;
      const token = response.data?.response?.token;
      const name = response.data?.response?.name;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (role === 'admin') {
        localStorage.setItem('role', 'admin');
        localStorage.setItem('name', 'admin');
        navigate('/admin/Dashboard');
      } else {
        localStorage.setItem('role', 'user');
        localStorage.setItem('name', name || '');
        navigate('/user/Dashboard');
      }
    } else {
      setError(response.message || 'Giriş başarısız.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Giriş Yap</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Şifre</label>
          <input type="password" id="password" name="password"
            value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="auth-btn">Giriş Yap</button>
        <div className="auth-switch-text">
          Üye değil misin?{' '}
          <Link to="/register" className="auth-link">Üye ol</Link>
        </div>
        <div className="auth-switch-text" style={{ marginTop: '0.5rem' }}>
          <Link to="/reset-password" className="auth-link">Şifreni mi unuttun? Şifre Sıfırla</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
