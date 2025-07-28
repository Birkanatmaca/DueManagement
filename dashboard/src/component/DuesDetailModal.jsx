import React from 'react';
import '../assets/duesdetailmodal.scss';

const DuesDetailModal = ({ open, onClose, dues }) => {
  if (!open) return null;
  return (
    <div className="duesdetail-modal__overlay">
      <div className="duesdetail-modal">
        <button className="duesdetail-modal__close" onClick={onClose}>&times;</button>
        <h2>Aidat Detayları</h2>
        <div className="duesdetail-modal__content">
          <div className="duesdetail-modal__field">
            <label>Çocuk Adı Soyadı:</label>
            <input type="text" value={dues.athlete || ''} readOnly />
          </div>
          <div className="duesdetail-modal__field">
            <label>Ödeme Bilgisi:</label>
            <input type="text" value={dues.status || ''} readOnly />
          </div>
          <div className="duesdetail-modal__field">
            <label>Sporcu Numarası:</label>
            <input type="text" value={dues.athleteNumber || ''} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuesDetailModal; 