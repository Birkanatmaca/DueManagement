import React, { useState, useEffect } from 'react';
import { MdFamilyRestroom } from 'react-icons/md';
import '../assets/parentmodal.scss';

const ParentDetailModal = ({ open, onClose, parent, getParentDetails }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && parent && parent.id && getParentDetails) {
      setLoading(true);
      const token = localStorage.getItem('token') || 'demo-token';
      getParentDetails(token, parent.id)
        .then(res => {
          if (res && res.data && Array.isArray(res.data.response?.children)) {
            setChildren(res.data.response.children);
          } else {
            setChildren([]);
          }
        })
        .catch(() => setChildren([]))
        .finally(() => setLoading(false));
    }
  }, [open, parent, getParentDetails]);

  if (!open) return null;
  return (
    <div className="parent-modal__overlay">
      <div className="parent-modal">
        <button className="parent-modal__close" onClick={onClose}>&times;</button>
        <h2>Veli Detayları</h2>
        <div className="parent-modal__content">
          <div className="parent-modal__field">
            <label>Veli Adı:</label>
            <input type="text" value={parent.name || ''} readOnly />
          </div>
          <div className="parent-modal__field">
            <label>Veli Soyadı:</label>
            <input type="text" value={parent.surname || ''} readOnly />
          </div>
          <div className="parent-modal__field">
            <label>Telefon:</label>
            <input type="text" value={parent.phone || ''} readOnly />
          </div>
          <div className="parent-modal__field">
            <label>E-posta:</label>
            <input type="text" value={parent.email || ''} readOnly />
          </div>
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '10px', color: '#e2e8f0' }}>Çocuklar</h3>
            {loading ? (
              <div style={{ color: '#94a3b8' }}>Yükleniyor...</div>
            ) : children.length === 0 ? (
              <div style={{ color: '#ef4444' }}>Hiçbir çocuk eşleşmemiş.</div>
            ) : (
              <div className="parent-modal__children-list">
                {children.map((child, index) => (
                  <div key={child.id} className="parent-modal__child-card">
                    <div className="avatar">{child.name?.[0]}</div>
                    <div className="info">
                      <div className="name">{child.name} {child.surname}</div>
                      <div className="meta"><strong>Sporcu No:</strong> {child.athlete_number}</div>
                      <div className="meta"><strong>Doğum Tarihi:</strong> {child.birth_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDetailModal; 