import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.scss';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../api';
import React from 'react';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="title">
          <h1>Hoş Geldiniz</h1>
          <p>
            {isLoginView
              ? 'Giriş yapmak için bilgilerinizi girin'
              : 'Devam etmek için bir hesap oluşturun'}
          </p>
        </div>

        <div className="tab-switch">
          <button
            onClick={() => setIsLoginView(true)}
            className={isLoginView ? 'active' : 'inactive'}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={!isLoginView ? 'active' : 'inactive'}
          >
            Kayıt Ol
          </button>
        </div>

        {isLoginView ? <LoginForm /> : <RegisterForm setIsLoginView={setIsLoginView} />}
      </div>
    </div>
  );
}

// Backend login fonksiyonu
const backendLogin = async (phone, password) => {
  const response = await api.post('/login', {
    data: {
      request: {
        phone,
        password
      }
    }
  });
  return response.data;
};

// Backend register fonksiyonu
const backendRegister = async (name, last_name, email, phone, password) => {
  const response = await api.post('/register', {
    data: {
      request: {
        name,
        last_name,
        email,
        phone,
        password
      }
    }
  });
  return response.data;
};

// Backend verify code fonksiyonu
const backendVerifyCode = async (email, code) => {
  const response = await api.post('/verify-code', {
    data: {
      request: { email, code }
    }
  });
  return response.data;
};
// Backend resend code fonksiyonu
const backendResendCode = async (email) => {
  const response = await api.post('/resend-code', {
    data: {
      request: { email }
    }
  });
  return response.data;
};

function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await backendLogin(phone, password);
      if (response.data && response.data.status === 'OK' && response.data.type === 'LoginSuccess') {
        const role = response.data.response.role;
        const token = response.data.response.token;
        localStorage.setItem('token', token);
        if (role === 'admin') navigate('/admin');
        else if (role === 'manager') navigate('/manager');
        else if (role === 'user') navigate('/user');
        else if (role === 'veli' || role === 'parent') navigate('/veli');
        else setError('Geçersiz rol');
      } else {
        setError('Telefon veya şifre yanlış');
      }
    } catch (err) {
      setError('Bir sunucu hatası oluştu');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Telefon veya E-posta"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error-message">{error}</p>}
      <button type="submit">Giriş Yap</button>
    </form>
  );
}

function RegisterForm({ setIsLoginView }) {
  const [name, setName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');

  // Anlık hata mesajları
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');

  const [step, setStep] = useState('register'); // 'register' | 'verify' | 'success'
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendActive, setResendActive] = useState(false);
  const navigate = useNavigate();

  // Timer effect
  React.useEffect(() => {
    if (step !== 'verify') return;
    if (timer === 0) {
      setResendActive(true);
      return;
    }
    setResendActive(false);
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, step]);

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

  // Anlık kontroller
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

  // Kayıt submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !validatePhone(phone) || !isPasswordValid || !passwordsMatch) {
      setError('Lütfen tüm alanları doğru doldurun.');
      return;
    }
    setError('');
    try {
      const response = await backendRegister(name, last_name, email, phone, password);
      if (
        (response.success) ||
        (response.data && response.data.status === 'OK' && response.data.type === 'RegistrationSuccess')
      ) {
        setStep('verify');
        setTimer(60);
        setVerifyError('');
      } else {
        setError(response.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir sunucu hatası oluştu');
    }
  };

  // Kod doğrulama submit
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError('');
    try {
      const response = await backendVerifyCode(email, verifyCode);
      if (
        (response.success) ||
        (response.data && response.data.status === 'OK' && response.data.type === 'VerificationSuccess')
      ) {
        setStep('success');
        setTimeout(() => {
          setIsLoginView(true);
        }, 2000);
      } else {
        setVerifyError(response.message || 'Kod yanlış veya süresi doldu.');
      }
    } catch {
      setVerifyError('Bir sunucu hatası oluştu');
    }
  };

  // Kod yeniden gönder
  const handleResend = async () => {
    setResendActive(false);
    setTimer(60);
    setVerifyError('');
    try {
      await backendResendCode(email);
    } catch {}
  };

  // Show the verify step as a modal overlay
  if (step === 'verify') {
    return (
      <div className="verify-modal-overlay">
        <form onSubmit={handleVerify} className="verify-form verify-modal" onClick={e => e.stopPropagation()}>
          <div className="verify-info">Mail adresinize gelen 6 haneli kodu giriniz.</div>
          <input
            type="text"
            maxLength={6}
            placeholder="Doğrulama Kodu"
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            required
          />
          <div className="verify-timer">
            {timer > 0 ? (
              <span>Kalan süre: {timer} sn</span>
            ) : (
              <button type="button" className="resend-btn" onClick={handleResend} disabled={!resendActive}>Yeniden Gönder</button>
            )}
          </div>
          {verifyError && <p className="error-message">{verifyError}</p>}
          <button type="submit" className="add-btn">Kodu Doğrula</button>
        </form>
        <div className="verify-modal-bg" onClick={() => setStep('register')}></div>
      </div>
    );
  }
  if (step === 'success') {
    return (
      <div className="verify-success">
        <CheckCircleIcon style={{ color: '#2ecc71', fontSize: 48, marginBottom: 12 }} />
        <div>Üyelik başarıyla tamamlandı! Giriş ekranına yönlendiriliyorsunuz...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="İsim"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Soyisim"
        value={last_name}
        onChange={(e) => setLastName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="E-posta Adresi"
        value={email}
        onChange={handleEmailChange}
        required
      />
      {emailError && <p className="error-message">{emailError}</p>}

      <input
        type="tel"
        placeholder="Telefon Numaranız (05XXXXXXXXX)"
        value={phone}
        onChange={handlePhoneChange}
        required
      />
      {phoneError && <p className="error-message">{phoneError}</p>}

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setError('')} // Hata temizleme
        required
      />

      {password.length > 0 && (
        <div className="password-checklist">
          <p className={passwordRules.length ? 'valid' : 'invalid'}>
            {passwordRules.length ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
            En az 8 karakter
          </p>
          <p className={passwordRules.upper ? 'valid' : 'invalid'}>
            {passwordRules.upper ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
            En az 1 büyük harf
          </p>
          <p className={passwordRules.number ? 'valid' : 'invalid'}>
            {passwordRules.number ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
            En az 1 sayı
          </p>
        </div>
      )}

      {isPasswordValid && (
        <>
          <input
            type="password"
            placeholder="Tekrar şifrenizi giriniz"
            value={repeatPassword}
            onChange={handleRepeatPasswordChange}
            required
          />
          {repeatPasswordError && <p className="error-message">{repeatPasswordError}</p>}
        </>
      )}

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        disabled={
          !!emailError || !!phoneError || !isPasswordValid || !passwordsMatch
        }
      >
        Kayıt Ol
      </button>
    </form>
  );
}
