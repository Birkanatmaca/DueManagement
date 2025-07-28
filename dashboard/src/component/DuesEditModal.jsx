import React from 'react';
import CustomDropdown from './CustomDropdown';
import ConfirmModal from './ConfirmModal';
import '../assets/dueseditmodal.scss';

const statusOptions = [
  { value: 'Ödendi', label: 'Ödendi' },
  { value: 'Ödenmedi', label: 'Ödenmedi' },
];

const DuesEditModal = ({ open, onClose, dues, onSave }) => {
  const [form, setForm] = React.useState({
    status: '',
    amount: '',
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    if (dues) {
      setForm({
        status: dues.status || '',
        amount: dues.amount || '',
      });
    }
  }, [dues, open]);

  const handleDropdownChange = (val) => {
    setForm({ ...form, status: val });
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    // Gerekli alanları gönder
    onSave && onSave({ 
      id: dues.id,
      amount: parseFloat(form.amount) || 0,
      status: form.status 
    });
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  if (!open) return null;
  return (
    <>
      <div className="duesedit-modal__overlay">
        <div className="duesedit-modal">
          <button className="duesedit-modal__close" onClick={onClose}>&times;</button>
          <h2>Aidat Düzenle</h2>
          <form className="duesedit-modal__content" onSubmit={handleSubmit}>
            <div className="duesedit-modal__field">
              <label>Çocuk Adı Soyadı:</label>
              <input name="athlete" type="text" value={dues.athlete || ''} readOnly />
            </div>
            <div className="duesedit-modal__field">
              <label>Aidat Tutarı (₺):</label>
              <input 
                name="amount" 
                type="number" 
                value={form.amount} 
                onChange={handleInputChange}
                placeholder="Tutar giriniz"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="duesedit-modal__field">
              <label>Ödeme Bilgisi:</label>
              <CustomDropdown
                options={statusOptions}
                value={form.status}
                onChange={handleDropdownChange}
                placeholder="Durum seçiniz"
              />
            </div>
            <div className="duesedit-modal__field">
              <label>Sporcu Numarası:</label>
              <input name="athleteNumber" type="text" value={dues.athleteNumber || ''} readOnly />
            </div>
            <button type="submit" className="duesedit-modal__save">Kaydet</button>
          </form>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Değişiklikleri kaydetmek istediğinize emin misiniz?"
        description="Aidat tutarı ve ödeme durumu güncellenecek."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default DuesEditModal; 