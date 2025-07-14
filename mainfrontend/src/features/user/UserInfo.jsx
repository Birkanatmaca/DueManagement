import React, { useState } from 'react';

const MOCK_USER = {
  name: 'Ahmet',
  surname: 'Yılmaz',
  phone: '05551234567',
  email: 'ahmet.yilmaz@example.com',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 700);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export default function UserInfo() {
  const [user, setUser] = useState(MOCK_USER);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(user);
  const isMobile = useIsMobile();

  const handleEdit = () => {
    setForm(user);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(form);
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 420, margin: isMobile ? '0' : '0 auto', width: '100%', padding: isMobile ? '0 0.5rem' : 0 }}>
      <h2 style={{ textAlign: 'center', marginBottom: isMobile ? 14 : 18, fontSize: isMobile ? '1.35rem' : '1.15rem', letterSpacing: 0.2, color: '#1976d2' }}>Bilgilerim</h2>
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 0 : 16,
        boxShadow: isMobile ? '0 1px 8px rgba(21,101,192,0.07)' : '0 2px 12px rgba(21,101,192,0.10)',
        padding: isMobile ? '1.2rem 1rem' : '1.5rem 1.2rem',
        margin: isMobile ? '0 -0.5rem' : '0 auto',
        maxWidth: isMobile ? '100%' : 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '1.1rem' : '0.7rem',
        fontSize: isMobile ? '1.08rem' : '1.05rem',
        alignItems: isMobile ? 'stretch' : 'flex-start',
      }}>
        <div style={{ fontWeight: 600, color: '#1565c0', fontSize: isMobile ? '1.13rem' : '1.05rem' }}><b>Ad:</b> <span style={{ color: '#213547', fontWeight: 500 }}>{user.name}</span></div>
        <div style={{ fontWeight: 600, color: '#1565c0', fontSize: isMobile ? '1.13rem' : '1.05rem' }}><b>Soyad:</b> <span style={{ color: '#213547', fontWeight: 500 }}>{user.surname}</span></div>
        <div style={{ fontWeight: 600, color: '#1565c0', fontSize: isMobile ? '1.13rem' : '1.05rem' }}><b>Telefon:</b> <span style={{ color: '#213547', fontWeight: 500 }}>{user.phone}</span></div>
        <div style={{ fontWeight: 600, color: '#1565c0', fontSize: isMobile ? '1.13rem' : '1.05rem' }}><b>E-posta:</b> <span style={{ color: '#213547', fontWeight: 500 }}>{user.email}</span></div>
        <button
          style={{
            marginTop: isMobile ? '1.5rem' : '1.2rem',
            background: '#fbc02d',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: isMobile ? '0.9rem 0' : '0.6rem 1.2rem',
            fontWeight: 600,
            fontSize: isMobile ? '1.08rem' : '1rem',
            cursor: 'pointer',
            alignSelf: isMobile ? 'stretch' : 'flex-end',
            boxShadow: isMobile ? '0 1px 6px rgba(21,101,192,0.07)' : 'none',
            letterSpacing: 0.2,
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#f9a825')}
          onMouseOut={e => (e.currentTarget.style.background = '#fbc02d')}
          onClick={handleEdit}
        >
          Bilgilerimi Düzenle
        </button>
      </div>
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? 0 : 'calc(56px + 2rem)',
            left: isMobile ? 0 : 240,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 3001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '0.5rem' : '2rem',
            overflowY: 'auto',
          }}
          onClick={() => setShowForm(false)}
        >
          <form
            style={{
              background: '#fff',
              borderRadius: isMobile ? 0 : 12,
              boxShadow: isMobile ? '0 1px 8px rgba(21,101,192,0.07)' : '0 4px 24px rgba(0,0,0,0.13)',
              padding: isMobile ? '1.2rem 1rem 1rem 1rem' : '1.2rem 1rem 1rem 1rem',
              minWidth: 0,
              width: isMobile ? '100%' : 350,
              maxWidth: isMobile ? '100%' : 350,
              maxHeight: '95vh',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1.1rem' : '0.8rem',
              position: 'relative',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: isMobile ? '2rem' : '1.4rem',
                color: '#888',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              &times;
            </button>
            <h3 style={{ textAlign: 'center', margin: 0, fontSize: isMobile ? '1.18rem' : '1.1rem', marginBottom: isMobile ? 10 : 0, color: '#1976d2', fontWeight: 700 }}>Bilgilerimi Düzenle</h3>
            <input
              name="name"
              type="text"
              placeholder="Ad"
              value={form.name}
              onChange={handleChange}
              required
              style={{ padding: isMobile ? '13px' : '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: isMobile ? '1.08rem' : '1rem', marginBottom: isMobile ? 2 : 0 }}
            />
            <input
              name="surname"
              type="text"
              placeholder="Soyad"
              value={form.surname}
              onChange={handleChange}
              required
              style={{ padding: isMobile ? '13px' : '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: isMobile ? '1.08rem' : '1rem', marginBottom: isMobile ? 2 : 0 }}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Telefon"
              value={form.phone}
              onChange={handleChange}
              required
              style={{ padding: isMobile ? '13px' : '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: isMobile ? '1.08rem' : '1rem', marginBottom: isMobile ? 2 : 0 }}
            />
            <input
              name="email"
              type="email"
              placeholder="E-posta"
              value={form.email}
              onChange={handleChange}
              required
              style={{ padding: isMobile ? '13px' : '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: isMobile ? '1.08rem' : '1rem', marginBottom: isMobile ? 2 : 0 }}
            />
            <button
              type="submit"
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: isMobile ? '1rem 0' : '0.7rem 1.2rem',
                fontWeight: 600,
                fontSize: isMobile ? '1.08rem' : '1rem',
                cursor: 'pointer',
                marginTop: isMobile ? '0.5rem' : '0.2rem',
                letterSpacing: 0.2,
              }}
            >
              Kaydet
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 