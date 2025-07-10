import React from 'react';
import './PlayerForm.scss';

const PlayerForm = ({ values, onChange, onSubmit, onClose, mode }) => (
  <div className="modal-overlay" onClick={onClose}>
    <form className="add-player-form" onClick={e => e.stopPropagation()} onSubmit={onSubmit}>
      <button type="button" className="close-x" onClick={onClose}>&times;</button>
      <h3>{mode === 'edit' ? 'Sporcuyu Düzenle' : 'Yeni Sporcu Ekle'}</h3>
      <input name="name" type="text" placeholder="Sporcu Adı" value={values.name} onChange={onChange} required />
      <input name="surname" type="text" placeholder="Sporcu Soyadı" value={values.surname} onChange={onChange} required />
      <input name="birthdate" type="date" placeholder="Doğum Tarihi" value={values.birthdate} onChange={onChange} required />
      <input name="number" type="text" placeholder="Sporcu No (Opsiyonel)" value={values.number} onChange={onChange} />
      <input name="parent" type="text" placeholder="Veli Adı Soyadı (Opsiyonel)" value={values.parent} onChange={onChange} />
      <input name="contact" type="text" placeholder="İletişim Numarası (Opsiyonel)" value={values.contact} onChange={onChange} />
      <div className="form-actions">
        <button type="submit" className="add-btn">Kaydet</button>
      </div>
    </form>
  </div>
);

export default PlayerForm; 