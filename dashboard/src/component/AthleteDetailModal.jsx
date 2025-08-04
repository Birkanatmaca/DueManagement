import React, { useState, useEffect } from 'react';
import '../assets/athletedetailmodal.scss';
import { getParentDetails } from '../services/adminServices';

const AthleteDetailModal = ({ open, onClose, athlete }) => {
  const [parentInfo, setParentInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && athlete && athlete.parent_id) {
      setLoading(true);
      const token = localStorage.getItem('token') || 'demo-token';
      getParentDetails(token, athlete.parent_id)
        .then(res => {
          if (res && res.data && res.data.response?.parent) {
            setParentInfo(res.data.response.parent);
          } else {
            setParentInfo(null);
          }
        })
        .catch(() => setParentInfo(null))
        .finally(() => setLoading(false));
    } else {
      setParentInfo(null);
    }
  }, [open, athlete]);

  if (!open) return null;

  return (
    <div className="athlete-modal__overlay">
      <div className="athlete-modal">
        <button className="athlete-modal__close" onClick={onClose}>&times;</button>
        <h2>Sporcu Detayları</h2>
        <div className="athlete-modal__content">
          <div className="athlete-modal__field">
            <label>Sporcu Adı:</label>
            <input type="text" value={athlete.ad || ''} readOnly />
          </div>
          <div className="athlete-modal__field">
            <label>Sporcu Soyadı:</label>
            <input type="text" value={athlete.soyad || ''} readOnly />
          </div>
          <div className="athlete-modal__field">
            <label>Sporcu Numarası:</label>
            <input type="text" value={athlete.numara || ''} readOnly />
          </div>
          <div className="athlete-modal__field">
            <label>Doğum Tarihi:</label>
            <input type="text" value={athlete.dogumTarihi || ''} readOnly />
          </div>

          <div style={{ marginTop: '20px', borderTop: '2px solid #475569', paddingTop: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: '#e2e8f0', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Eşleşmiş Veli Bilgileri</h3>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '20px' }}>Yükleniyor...</div>
            ) : parentInfo ? (
              <>
                <div className="athlete-modal__field">
                  <label>Veli Adı Soyadı:</label>
                  <input type="text" value={`${parentInfo.name || ''} ${parentInfo.last_name || ''}`} readOnly />
                </div>
                <div className="athlete-modal__field">
                  <label>Veli Telefon:</label>
                  <input type="text" value={parentInfo.phone || ''} readOnly />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '14px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Eşleşmiş veli bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDetailModal; 