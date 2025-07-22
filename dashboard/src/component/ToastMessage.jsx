import React, { useEffect } from 'react';
import '../assets/toastmessage.scss';

const ToastMessage = ({ open, message, type = 'info', duration = 2500, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className={`toast-message toast-message--${type}`}>
      {message}
    </div>
  );
};

export default ToastMessage; 