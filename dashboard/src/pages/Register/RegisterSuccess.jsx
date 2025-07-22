import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => navigate('/login'), 2000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Tebrikler!</h2>
        <p>Üyelik başarıyla tamamlandı. Giriş sayfasına yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
};

export default RegisterSuccess;