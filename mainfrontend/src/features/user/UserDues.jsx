import React, { useState } from 'react';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const currentYear = new Date().getFullYear();

const MOCK_DUES = [
  { month: 1, is_paid: true, amount: 500, due_date: '2024-01-31' },
  { month: 2, is_paid: false, amount: 500, due_date: '2024-02-29' },
  { month: 3, is_paid: true, amount: 500, due_date: '2024-03-31' },
  { month: 4, is_paid: false, amount: 500, due_date: '2024-04-30' },
  { month: 5, is_paid: false, amount: 500, due_date: '2024-05-31' },
  { month: 6, is_paid: true, amount: 500, due_date: '2024-06-30' },
  { month: 7, is_paid: false, amount: 500, due_date: '2024-07-31' },
  { month: 8, is_paid: false, amount: 500, due_date: '2024-08-31' },
  { month: 9, is_paid: false, amount: 500, due_date: '2024-09-30' },
  { month: 10, is_paid: false, amount: 500, due_date: '2024-10-31' },
  { month: 11, is_paid: false, amount: 500, due_date: '2024-11-30' },
  { month: 12, is_paid: false, amount: 500, due_date: '2024-12-31' },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 700);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export default function UserDues() {
  const [year, setYear] = useState(currentYear);
  const [showModal, setShowModal] = useState(false);
  const [modalDue, setModalDue] = useState(null);
  const isMobile = useIsMobile();

  const handlePrevYear = () => setYear(y => y - 1);
  const handleNextYear = () => setYear(y => y + 1);

  const handleView = (monthIdx) => {
    const due = MOCK_DUES.find(d => d.month === monthIdx + 1) || {
      month: monthIdx + 1,
      is_paid: false,
      amount: 500,
      due_date: `${year}-${String(monthIdx + 1).padStart(2, '0')}-28`,
    };
    setModalDue({ ...due, year });
    setShowModal(true);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 18 }}>Aidatlarım</h2>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(21, 101, 192, 0.10)',
        padding: isMobile ? '1rem 0.5rem' : '2rem 2.5rem',
        margin: '0 auto 2rem auto',
        width: '100%',
        maxWidth: 800,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <button onClick={handlePrevYear} style={{ fontSize: 18, padding: '2px 12px', background: '#f5faff', border: '1.5px solid #e3eafc', borderRadius: 8, cursor: 'pointer' }}>{'<'}</button>
          <span style={{ fontWeight: 600, fontSize: 20 }}>{year}</span>
          <button onClick={handleNextYear} style={{ fontSize: 18, padding: '2px 12px', background: '#f5faff', border: '1.5px solid #e3eafc', borderRadius: 8, cursor: 'pointer' }}>{'>'}</button>
        </div>
        {/* Masaüstü görünüm */}
        {!isMobile && (
          <div style={{ width: '100%' }}>
            <div style={{ minWidth: 600 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f5faff',
                borderRadius: '8px 8px 0 0',
                fontWeight: 600,
                color: '#1976d2',
                borderBottom: '2px solid #e3eafc',
                padding: '12px 0',
                fontSize: '1.08rem',
              }}>
                <div style={{ flex: 2, paddingLeft: 18 }}>Ay</div>
                <div style={{ flex: 2 }}>Durum</div>
                <div style={{ flex: 1, textAlign: 'center' }}>İşlemler</div>
              </div>
              {MONTHS.map((month, idx) => {
                const due = MOCK_DUES.find(d => d.month === idx + 1) || { is_paid: false };
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: idx === 11 ? 'none' : '1px solid #e3eafc',
                      padding: '14px 0',
                      fontSize: '1.05rem',
                      background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                    }}
                  >
                    <div style={{ flex: 2, paddingLeft: 18 }}>{month}</div>
                    <div style={{ flex: 2, color: due.is_paid ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{due.is_paid ? 'Ödendi' : 'Ödenmedi'}</div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <button
                        style={{ background: '#fbc02d', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 18px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.background = '#f9a825')}
                        onMouseOut={e => (e.currentTarget.style.background = '#fbc02d')}
                        onClick={() => handleView(idx)}
                      >
                        Görüntüle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Mobil görünüm */}
        {isMobile && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {MONTHS.map((month, idx) => {
              const due = MOCK_DUES.find(d => d.month === idx + 1) || { is_paid: false };
              return (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    boxShadow: '0 1px 6px rgba(21,101,192,0.07)',
                    padding: '1.1rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.7rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.18rem', marginBottom: '0.3rem', letterSpacing: '0.5px' }}>{month}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: due.is_paid ? '#2ecc71' : '#e74c3c', textAlign: 'center', margin: '0.5rem 0' }}>
                    {due.is_paid ? 'Ödendi' : 'Ödenmedi'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      style={{ background: '#fbc02d', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 22px', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', fontSize: '1rem' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f9a825')}
                      onMouseOut={e => (e.currentTarget.style.background = '#fbc02d')}
                      onClick={() => handleView(idx)}
                    >
                      Görüntüle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && modalDue && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
              padding: isMobile ? '1.2rem 1rem 1rem 1rem' : '2rem 2.5rem',
              minWidth: 0,
              width: isMobile ? '100%' : 400,
              maxWidth: isMobile ? '100%' : 400,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 10, right: 16, background: 'none', border: 'none', fontSize: '1.5rem', color: '#888', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ textAlign: 'center', margin: 0, fontSize: '1.2rem', marginBottom: 18 }}>Aidat Detayları</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><b>Ay:</b> {MONTHS[(modalDue.month ? Number(modalDue.month) - 1 : 0)]} {modalDue.year}</div>
              <div><b>Tutar:</b> {modalDue.amount ? modalDue.amount.toFixed(2) : '-'} TL</div>
              <div><b>Durum:</b> {modalDue.is_paid ? 'Ödendi' : 'Ödenmedi'}</div>
              <div><b>Son Ödeme Tarihi:</b> {modalDue.due_date || '-'}</div>
              <div><b>Sporcu:</b> Ahmet Yılmaz</div>
              <div><b>Veli:</b> Mehmet Yılmaz</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 