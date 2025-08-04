import React from 'react';
import { MdClose, MdEmail, MdPhone, MdPerson, MdCalendarToday } from 'react-icons/md';
import '../assets/parentmodal.scss';
import '../assets/waitingparents.scss';

const WaitingParentDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Veli Detayları</h2>
          <button className="modal-close" onClick={onClose}>
            <MdClose />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-item">
              <div className="detail-label">
                <MdPerson />
                <span>Ad Soyad:</span>
              </div>
              <div className="detail-value">
                {user.name} {user.last_name}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <MdEmail />
                <span>E-posta:</span>
              </div>
              <div className="detail-value">
                {user.email}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <MdPhone />
                <span>Telefon:</span>
              </div>
              <div className="detail-value">
                {user.phone}
              </div>
            </div>

            {user.birth_date && (
              <div className="detail-item">
                <div className="detail-label">
                  <MdCalendarToday />
                  <span>Doğum Tarihi:</span>
                </div>
                <div className="detail-value">
                  {new Date(user.birth_date).toLocaleDateString('tr-TR')}
                </div>
              </div>
            )}

            {user.created_at && (
              <div className="detail-item">
                <div className="detail-label">
                  <MdCalendarToday />
                  <span>Kayıt Tarihi:</span>
                </div>
                <div className="detail-value">
                  {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            )}

            {user.status && (
              <div className="detail-item">
                <div className="detail-label">
                  <span>Durum:</span>
                </div>
                <div className="detail-value">
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status === 'pending' ? 'Beklemede' : user.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {user.children && user.children.length > 0 && (
            <div className="detail-section">
              <h3>Çocukları</h3>
              <div className="children-list">
                {user.children.map((child, index) => (
                  <div key={index} className="child-item">
                    <div className="child-name">
                      {child.name} {child.surname}
                    </div>
                    {child.birth_date && (
                      <div className="child-birth">
                        {new Date(child.birth_date).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.notes && (
            <div className="detail-section">
              <h3>Notlar</h3>
              <div className="notes-content">
                {user.notes}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingParentDetailModal; 