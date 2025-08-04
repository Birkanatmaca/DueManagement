import React from 'react';
import { createPortal } from 'react-dom';
import '../assets/confirmmodal.scss';

const ConfirmModal = ({ open, title, description, onConfirm, onCancel, children }) => {
  if (!open) return null;
  
  return createPortal(
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3 className="confirm-modal__title">{title}</h3>
        <p className="confirm-modal__desc">{description}</p>
        {children}
        <div className="confirm-modal__actions">
          <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={onConfirm}>Evet</button>
          <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>Hayır</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal; 