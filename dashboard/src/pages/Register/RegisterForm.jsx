import React, { useState } from 'react';
import { backendRegister } from '../../../services/authService';
import '../../../assets/register.scss';

const RegisterForm = ({ setStep, setEmail }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmailState] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false);

  const validatePassword = (pw) => ({
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
  });
  const passwordRules = validatePassword(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !phone || !password || password !== repeatPassword) {
      setError('Lütfen tüm alanları doğru doldurun.');
      return;
    }
    try {
      const res = await backendRegister(name, lastName, email, phone, password);
      if (res.success) {
        setEmail(email);
        setStep('verify');
      } else {
        setError(res.message || 'Kayıt başarısız.');
      }
    } catch {
      setError('Sunucu hatası oluştu.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form register-form" onSubmit={handleRegister}>
        <h2>Kayıt Ol</h2>
        <div className="form-group">
          <label>Ad</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Soyad</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>E-posta</label>
          <input type="email" value={email} onChange={e => setEmailState(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Telefon</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => {
              setShowPasswordRules(true);
              setPasswordFieldFocused(true);
            }}
            onBlur={() => {
              setShowPasswordRules(false);
              setPasswordFieldFocused(false);
            }}
            required
          />
          {showPasswordRules && password && passwordFieldFocused && (
            <ul className="password-rules">
              <li className={passwordRules.length ? 'valid' : ''}>En az 8 karakter</li>
              <li className={passwordRules.upper ? 'valid' : ''}>En az 1 büyük harf</li>
              <li className={passwordRules.number ? 'valid' : ''}>En az 1 rakam</li>
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>Şifre Tekrar</label>
          <input 
            type="password" 
            value={repeatPassword} 
            onChange={e => setRepeatPassword(e.target.value)}
            onFocus={() => {
              setShowPasswordRules(false);
              setPasswordFieldFocused(false);
            }}
            required 
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-btn">Kayıt Ol</button>
      </form>
    </div>
  );
};

export default RegisterForm;