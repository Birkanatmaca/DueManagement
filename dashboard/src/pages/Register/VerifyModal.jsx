import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendVerifyCode, backendResendCode } from '../../services/authServices';
import '../../assets/verify.scss';

const CIRCLE_RADIUS = 18;
const CIRCLE_CIRCUM = 2 * Math.PI * CIRCLE_RADIUS;

const VerifyModal = ({ email, setStep }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendActive, setResendActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [showCheck, setShowCheck] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer === 0) setResendActive(true);
    else {
      const intv = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(intv);
    }
  }, [timer]);

  useEffect(() => {
    let interval;
    if (success) {
      setProgress(0);
      setShowCheck(false);
      const start = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const percent = Math.min(elapsed / 3000, 1);
        setProgress(percent);
        if (percent === 1) {
          setShowCheck(true);
          clearInterval(interval);
        }
      }, 16);
      const timeout = setTimeout(() => navigate('/login'), 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
    return () => interval && clearInterval(interval);
  }, [success, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await backendVerifyCode(email, code);
      if (
        res.success ||
        (res.data && res.data.status === 'OK' && res.data.type === 'VerificationSuccess')
      ) {
        setSuccess(true);
      } else {
        setError(res.message || 'Kod doğrulanamadı.');
      }
    } catch {
      setError('Sunucu hatası.');
    }
  };

  const handleResend = async () => {
    try {
      await backendResendCode(email);
      setTimer(60);
      setResendActive(false);
    } catch {
      setError('Kod tekrar gönderilemedi.');
    }
  };

  // Calculate progress for timer circle (1 = full, 0 = empty)
  const timerProgress = timer > 0 ? timer / 60 : 0;

  return (
    <div className="verify-modal-overlay">
      <div className="verify-modal-blur" />
      <form onSubmit={handleVerify} className="verify-form verify-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="verify-close" aria-label="Kapat" onClick={() => setStep('register')}>&times;</button>
        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
            <div style={{ color: '#2ecc71', fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
              Başarıyla kaydoldunuz, giriş ekranına yönlendiriliyorsunuz...
            </div>
            <div style={{ position: 'relative', width: 60, height: 60, marginTop: 8 }}>
              <svg width={60} height={60}>
                <circle
                  cx={30}
                  cy={30}
                  r={24}
                  stroke="#e0e0e0"
                  strokeWidth={4}
                  fill="none"
                />
                <circle
                  cx={30}
                  cy={30}
                  r={24}
                  stroke="#2ecc71"
                  strokeWidth={4}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
                {showCheck && (
                  <polyline
                    points="20,32 28,40 42,24"
                    fill="none"
                    stroke="#2ecc71"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>
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
                <button type="button" className="resend-btn" onClick={handleResend} disabled={!resendActive}>
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

export default VerifyModal;