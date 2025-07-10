import React from 'react';
import './ConfirmModal.scss';

const ConfirmModal = ({ text, onYes, onNo }) => (
  <div className="modal-overlay" onClick={onNo}>
    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
      <p>{text}</p>
      <div className="confirm-actions">
        <button className="yes-btn" onClick={onYes}>Evet</button>
        <button className="no-btn delete" onClick={onNo}>Hayır</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal; 