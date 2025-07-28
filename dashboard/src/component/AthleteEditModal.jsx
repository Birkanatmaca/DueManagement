import React, { useState, useEffect } from 'react';
import '../assets/athletedetailmodal.scss';
import ConfirmModal from './ConfirmModal';

const AthleteEditModal = ({ open, onClose, athlete, onSave, isAdding = false }) => {
  const [form, setForm] = useState({
    ad: '',
    soyad: '',
    numara: '',
    dogumTarihi: ''
  });
  const [initialForm, setInitialForm] = useState(form);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (athlete) {
      const newForm = {
        ad: athlete.ad || '',
        soyad: athlete.soyad || '',
        numara: athlete.numara || '',
        dogumTarihi: athlete.dogumTarihi || ''
      };
      setForm(newForm);
      setInitialForm(newForm);
    }
  }, [athlete, open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isChanged = () => {
    if (isAdding) {
      // For adding new athlete, check if required fields are filled
      return form.ad.trim() && form.soyad.trim() && form.dogumTarihi;
    }
    return Object.keys(form).some(key => form[key] !== initialForm[key]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onSave && onSave(form);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  if (!open) return null;

  return (
    <div className="athlete-modal__overlay">
      <div className="athlete-modal">
        <button className="athlete-modal__close" onClick={onClose}>&times;</button>
        <h2>{isAdding ? 'Sporcu Ekle' : 'Sporcu Düzenle'}</h2>
        <form className="athlete-modal__content" onSubmit={handleSubmit}>
          <div className="athlete-modal__field">
            <label>Sporcu Adı:</label>
            <input name="ad" type="text" value={form.ad} onChange={handleChange} required />
          </div>
          <div className="athlete-modal__field">
            <label>Sporcu Soyadı:</label>
            <input name="soyad" type="text" value={form.soyad} onChange={handleChange} required />
          </div>
          {!isAdding && (
            <div className="athlete-modal__field">
              <label>Sporcu Numarası:</label>
              <input name="numara" type="text" value={form.numara} onChange={handleChange} required />
            </div>
          )}
          <div className="athlete-modal__field">
            <label>Doğum Tarihi:</label>
            <input name="dogumTarihi" type="date" value={form.dogumTarihi} onChange={handleChange} required />
          </div>
          <button type="submit" className="athlete-modal__save" disabled={!isChanged()}>
            {isAdding ? 'Ekle' : 'Kaydet'}
          </button>
        </form>
        <ConfirmModal
          open={confirmOpen}
          title={isAdding ? "Eklemek istediğinize emin misiniz?" : "Kaydetmek istediğinize emin misiniz?"}
          description={isAdding ? "Yeni sporcu eklenecek." : "Yaptığınız değişiklikler kaydedilecek."}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AthleteEditModal; 