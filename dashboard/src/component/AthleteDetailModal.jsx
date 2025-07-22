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

          <div style={{ marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#1a237e' }}>Eşleşmiş Veli Bilgileri</h3>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#666' }}>Yükleniyor...</div>
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
              <div style={{ textAlign: 'center', color: '#e53935' }}>Eşleşmiş veli bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDetailModal; 