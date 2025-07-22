import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/register.scss';
import { backendRegister } from '../../services/authServices';
import VerifyModal from './VerifyModal';

function Register() {
  const [name, setName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [step, setStep] = useState('register'); // 'register' | 'verify' | 'success'
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validateEmail = (mail) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(mail);
  const validatePhone = (p) => /^05\d{9}$/.test(p);
  const validatePassword = (pw) => ({
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
  });

  const passwordRules = validatePassword(password);
  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch = password === repeatPassword;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!validateEmail(val)) setEmailError('Geçerli bir e-posta adresi giriniz.');
    else setEmailError('');
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (!validatePhone(val)) setPhoneError('Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır.');
    else setPhoneError('');
  };

  const handleRepeatPasswordChange = (e) => {
    const val = e.target.value;
    setRepeatPassword(val);
    if (password !== val) setRepeatPasswordError('Şifreniz eşleşmedi. Lütfen aynı şifreyi giriniz.');
    else setRepeatPasswordError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePhone(phone) || !isPasswordValid || !passwordsMatch) {
      setError('Lütfen tüm alanları doğru doldurun.');
      return;
    }
    setError('');
    try {
      const response = await backendRegister(name, last_name, email, phone, password);
      let customError = '';
      if (response.data && response.data.message === 'User with this email or phone already exists') {
        customError = 'Girilen e-posta veya telefon numarası mevcut, lütfen tekrar deneyin.';
      }
      if (
        response.success ||
        (response.data && response.data.status === 'OK' && response.data.type === 'RegistrationSuccess')
      ) {
        setStep('verify');
      } else {
        setError(customError || response.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir sunucu hatası oluştu');
    }
  };

  if (step === 'verify') {
    return <VerifyModal email={email} setStep={setStep} />;
  }

  if (step === 'success') {
    return (
      <div className="verify-success">
        <div>Üyelik başarıyla tamamlandı! Giriş ekranına yönlendiriliyorsunuz...</div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <form className="auth-form register-form" onSubmit={handleRegister}>
        <h2>Kayıt Ol</h2>
        <div className="form-group">
          <label htmlFor="name">Ad</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Soyad</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={last_name}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          {emailError && <span className="error-message">{emailError}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefon</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
          {phoneError && <span className="error-message">{phoneError}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
          />
          {passwordFocused && (
            <ul className="password-rules">
              <li className={passwordRules.length ? 'valid' : ''}>En az 8 karakter</li>
              <li className={passwordRules.upper ? 'valid' : ''}>En az 1 büyük harf</li>
              <li className={passwordRules.number ? 'valid' : ''}>En az 1 rakam</li>
            </ul>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="repeatPassword">Şifre Tekrar</label>
          <input
            type="password"
            id="repeatPassword"
            name="repeatPassword"
            value={repeatPassword}
            onChange={handleRepeatPasswordChange}
            required
          />
          {repeatPasswordError && <span className="error-message">{repeatPasswordError}</span>}
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-btn">Kayıt Ol</button>
        <div className="auth-switch-text">
          Üye misin?{' '}
          <Link to="/login" className="auth-link">Giriş yap</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;