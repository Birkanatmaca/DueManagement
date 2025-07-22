import React from 'react';
import '../assets/confirmmodal.scss';

const ConfirmModal = ({ open, title, description, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3 className="confirm-modal__title">{title}</h3>
        <p className="confirm-modal__desc">{description}</p>
        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={onConfirm}>Evet</button>
          <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>Hayır</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 