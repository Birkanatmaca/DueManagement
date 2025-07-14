import React, { useState } from 'react';

// Geçici boş çocuk verisi
const emptyChild = {
  name: '',
  surname: '',
  birthdate: '',
  athlete_number: '',
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

export default function UserChild() {
  const [child, setChild] = useState(null); // Başlangıçta çocuk yok
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyChild);
  const [error, setError] = useState('');
  const isMobile = useIsMobile();

  const handleOpenForm = () => {
    setForm(emptyChild);
    setError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.surname || !form.birthdate || !form.athlete_number) {
      setError('Tüm alanları doldurun.');
      return;
    }
    setChild({ ...form });
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Sporcum</h2>
      {child ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(21,101,192,0.08)',
            padding: '1.5rem 1.2rem',
            margin: '0 auto',
            maxWidth: 400,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem',
            fontSize: '1.05rem',
          }}
        >
          <div><b>Adı:</b> {child.name}</div>
          <div><b>Soyadı:</b> {child.surname}</div>
          <div><b>Doğum Tarihi:</b> {child.birthdate}</div>
          <div><b>Sporcu No:</b> {child.athlete_number}</div>
          <button
            style={{
              marginTop: '1.2rem',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
            onClick={handleOpenForm}
          >
            Düzenle
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.8rem 2rem',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
            onClick={handleOpenForm}
          >
            Sporcu Ekle
          </button>
        </div>
      )}
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
          onClick={handleCloseForm}
        >
          <form
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
              padding: isMobile ? '1.2rem 1rem 1rem 1rem' : '1.2rem 1.2rem 1.2rem 1.2rem',
              minWidth: 0,
              width: isMobile ? '100%' : 350,
              maxWidth: isMobile ? '100%' : 350,
              maxHeight: '95vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              position: 'relative',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              onClick={handleCloseForm}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                color: '#888',
                cursor: 'pointer',
                zIndex: 1,
              }}
            >
              &times;
            </button>
            <h3 style={{ textAlign: 'center', margin: 0, fontSize: '1.1rem' }}>Sporcu Bilgileri</h3>
            <input
              name="name"
              type="text"
              placeholder="Adı"
              value={form.name}
              onChange={handleChange}
              required
              style={{ padding: '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: '1rem' }}
            />
            <input
              name="surname"
              type="text"
              placeholder="Soyadı"
              value={form.surname}
              onChange={handleChange}
              required
              style={{ padding: '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: '1rem' }}
            />
            <input
              name="birthdate"
              type="date"
              placeholder="Doğum Tarihi"
              value={form.birthdate}
              onChange={handleChange}
              required
              style={{ padding: '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: '1rem' }}
            />
            <input
              name="athlete_number"
              type="text"
              placeholder="Sporcu No"
              value={form.athlete_number}
              onChange={handleChange}
              required
              style={{ padding: '9px', borderRadius: 6, border: '1px solid #e0e0e0', fontSize: '1rem' }}
            />
            {error && <div style={{ color: '#e53935', fontSize: '0.98rem', textAlign: 'center' }}>{error}</div>}
            <button
              type="submit"
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.7rem 1.2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '0.2rem',
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