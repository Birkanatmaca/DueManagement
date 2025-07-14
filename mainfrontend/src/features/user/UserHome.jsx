import React from 'react';

const MOCK_CHILD = {
  name: 'Ahmet',
  surname: 'Yılmaz',
  birth_date: '2012-05-10',
  athlete_number: '1001',
};

const MOCK_DUES = [
  { month: 'Mayıs', year: 2024, is_paid: true },
  { month: 'Haziran', year: 2024, is_paid: false },
  { month: 'Temmuz', year: 2024, is_paid: true },
];

// En üstteki kart için mevcut ayı bul
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const now = new Date();
const currentMonth = MONTHS[now.getMonth()];
const currentYear = now.getFullYear();
const currentDue = MOCK_DUES.find(d => d.month === currentMonth && d.year === currentYear);

export default function UserHome() {
  return (
    <div style={{ width: '100%' }}>
      {/* En üstte geniş bilgilendirici kart */}
      <div style={{
        background: currentDue
          ? (currentDue.is_paid ? '#e8f5e9' : '#ffebee')
          : '#fff',
        border: currentDue
          ? (currentDue.is_paid ? '1.5px solid #43a047' : '1.5px solid #e53935')
          : '1px solid #e3eafc',
        color: currentDue
          ? (currentDue.is_paid ? '#388e3c' : '#c62828')
          : '#213547',
        fontWeight: 500,
        textAlign: 'center',
        fontSize: '1.1rem',
        padding: '1.5rem 2rem',
        width: '100%',
        maxWidth: 700,
        margin: '0 auto 2rem auto',
        borderRadius: 12,
      }}>
        {currentDue
          ? (currentDue.is_paid
              ? `${currentMonth} ${currentYear} ödemesi gerçekleşmiştir.`
              : `${currentMonth} ${currentYear} ödemesi yatırılmamıştır!`)
          : `${currentMonth} ${currentYear} için aidat kaydı bulunamadı.`}
      </div>

      {/* Altında iki kart yan yana */}
      <div className="dashboard-cards-row" style={{ display: 'flex', gap: '2rem', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Çocuklarım kartı */}
        <div className="dashboard-card" style={{ flex: 1, maxWidth: 400, minWidth: 260 }}>
          <div className="card-label" style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>Çocuklarım</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, padding: '6px 8px' }}>Ad Soyad</td>
                <td style={{ padding: '6px 8px' }}>{MOCK_CHILD.name} {MOCK_CHILD.surname}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, padding: '6px 8px' }}>Doğum Tarihi</td>
                <td style={{ padding: '6px 8px' }}>{MOCK_CHILD.birth_date}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, padding: '6px 8px' }}>Sporcu No</td>
                <td style={{ padding: '6px 8px' }}>{MOCK_CHILD.athlete_number}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Aidatlarım kartı */}
        <div className="dashboard-card" style={{ flex: 1, maxWidth: 400, minWidth: 260 }}>
          <div className="card-label" style={{ fontSize: '1.2rem', marginBottom: '1rem', textAlign: 'center' }}>Aidatlarım</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f5faff' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Ay</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DUES.slice(-3).map((due, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 8px' }}>{due.month} {due.year}</td>
                  <td style={{ padding: '6px 8px', color: due.is_paid ? '#388e3c' : '#c62828', fontWeight: 500 }}>
                    {due.is_paid ? 'Ödendi' : 'Ödenmedi'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 