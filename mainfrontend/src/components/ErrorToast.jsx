import React from 'react';
import './ErrorToast.scss';

const ErrorToast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="error-toast" onClick={onClose}>
      {message}
    </div>
  );
};

export default ErrorToast; 