import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/auth.scss';
import { backendRequestPasswordReset, backendVerifyPasswordReset } from '../services/authServices';

const CIRCLE_RADIUS = 18;
const CIRCLE_CIRCUM = 2 * Math.PI * CIRCLE_RADIUS;

const EyeIcon = ({ visible, onClick }) => (
  <span
    onClick={onClick}
    style={{
      cursor: 'pointer',
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      userSelect: 'none',
      zIndex: 2
    }}
    title={visible ? 'Gizle' : 'Göster'}
  >
    {visible ? (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M1 11C2.73 6.61 6.86 3.5 11.5 3.5C16.14 3.5 20.27 6.61 22 11C20.27 15.39 16.14 18.5 11.5 18.5C6.86 18.5 2.73 15.39 1 11Z" stroke="#888" strokeWidth="1.5"/><circle cx="11.5" cy="11" r="3.5" stroke="#888" strokeWidth="1.5"/></svg>
    ) : (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M1 11C2.73 6.61 6.86 3.5 11.5 3.5C16.14 3.5 20.27 6.61 22 11C20.27 15.39 16.14 18.5 11.5 18.5C6.86 18.5 2.73 15.39 1 11Z" stroke="#888" strokeWidth="1.5"/><circle cx="11.5" cy="11" r="3.5" stroke="#888" strokeWidth="1.5"/><line x1="5" y1="17" x2="17" y2="5" stroke="#888" strokeWidth="1.5"/></svg>
    )}
  </span>
);

const VerifyResetModal = ({ email, phone, setStep }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (timer === 0) {
      // setResendActive(true); // This line was removed as per the edit hint.
    } else {
      const intv = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(intv);
    }
  }, [timer]);

  React.useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const res = await backendVerifyPasswordReset(email, phone, code);
    if (res.success || (res.data && res.data.status === 'OK')) {
      setSuccess(true);
    } else {
      setError(res.message || 'Kod doğrulanamadı.');
    }
  };

  // Calculate progress for timer circle (1 = full, 0 = empty)
  const timerProgress = timer > 0 ? timer / 60 : 0;

  return (
    <div className="verify-modal-overlay">
      <div className="verify-modal-blur" />
      <form onSubmit={handleVerify} className="verify-form verify-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="verify-close" aria-label="Kapat" onClick={() => setStep('form')}>&times;</button>
        {success ? (
          <div style={{ color: '#2ecc71', fontWeight: 600, fontSize: 18, margin: '32px 0', textAlign: 'center' }}>
            Şifreniz başarıyla değiştirildi! Giriş ekranına yönlendiriliyorsunuz...
          </div>
        ) : (
          <>
            <div className="verify-info">E-posta adresine gelen doğrulama kodunu giriniz</div>
            <label htmlFor="verify-code" className="verify-form-label">Doğrulama Kodu</label>
            <input
              id="verify-code"
              className="verify-form-input"
              type="text"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
            <div className="verify-timer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              {timer > 0 ? (
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                  <svg width={44} height={44}>
                    <circle
                      cx={22}
                      cy={22}
                      r={CIRCLE_RADIUS}
                      stroke="#e0e0e0"
                      strokeWidth={4}
                      fill="none"
                    />
                    <circle
                      cx={22}
                      cy={22}
                      r={CIRCLE_RADIUS}
                      stroke="#2196f3"
                      strokeWidth={4}
                      fill="none"
                      strokeDasharray={CIRCLE_CIRCUM}
                      strokeDashoffset={CIRCLE_CIRCUM * (1 - timerProgress)}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: 0, left: 0, width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, color: '#2196f3', fontSize: 16
                  }}>{timer}s</span>
                </div>
              ) : (
                <button type="button" className="resend-btn" disabled>
                  Kodu Tekrar Gönder
                </button>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="auth-btn">Kodu Doğrula</button>
          </>
        )}
      </form>
    </div>
  );
};

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [step, setStep] = useState('form');
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const formFieldsRef = useRef(null);

  const validatePassword = (pw) => ({
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
  });
  const passwordRules = validatePassword(password);

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      if (formFieldsRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = formFieldsRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance
        setIsScrolledToBottom(isAtBottom);
      }
    };

    const formFieldsElement = formFieldsRef.current;
    if (formFieldsElement) {
      formFieldsElement.addEventListener('scroll', handleScroll);
      return () => formFieldsElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone || !password || password !== repeatPassword) {
      setError('Lütfen tüm alanları doğru doldurun.');
      return;
    }
    setError('');
    const res = await backendRequestPasswordReset(email, phone, password, repeatPassword);
    if (res.success || (res.data && res.data.status === 'OK')) {
      setStep('verify');
    } else {
      setError(res.message || 'Bir hata oluştu.');
    }
  };

  if (step === 'verify') {
    return <VerifyResetModal email={email} phone={phone} setStep={setStep} />;
  }

  return (
    <div className="auth-container">
      <div className="system-title">
        <h1>AİDAT YÖNETİM PANELİ</h1>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Şifre Sıfırla</h2>
        <div 
          ref={formFieldsRef}
          className={`form-fields-container ${isScrolledToBottom ? 'scrolled-to-bottom' : ''}`}
        >
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Telefon</label>
            <input type="text" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Yeni Şifre</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                style={{ flex: 1, paddingRight: 36 }}
              />
              <EyeIcon visible={showPassword} onClick={() => setShowPassword(v => !v)} />
            </div>
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
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showRepeatPassword ? 'text' : 'password'}
                id="repeatPassword"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                required
                style={{ flex: 1, paddingRight: 36, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
              />
              <EyeIcon visible={showRepeatPassword} onClick={() => setShowRepeatPassword(v => !v)} />
              {/* Progress bar for password match, flush with input */}
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -1,
                height: 6,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                width: '100%',
                overflow: 'hidden',
                zIndex: 1
              }}>
                <div style={{
                  height: '100%',
                  width: password.length === 0 ? '0%' : `${Math.min((repeatPassword.length / password.length) * 100, 100)}%`,
                  background: password && repeatPassword && password === repeatPassword ? '#10b981' : '#ef4444',
                  transition: 'width 0.3s, background 0.3s'
                }} />
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
        <button type="submit" className="auth-btn">Sıfırla</button>
        <div className="auth-switch-text">
          <Link to="/login" className="auth-link">Giriş yap ekranına dön</Link>
        </div>
      </form>
      

    </div>
  );
};

export default ResetPassword; 