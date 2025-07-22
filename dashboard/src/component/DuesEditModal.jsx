import React from 'react';
import CustomDropdown from './CustomDropdown';
import '../assets/dueseditmodal.scss';

const statusOptions = [
  { value: 'Ödendi', label: 'Ödendi' },
  { value: 'Ödenmedi', label: 'Ödenmedi' },
];

const DuesEditModal = ({ open, onClose, dues, onSave }) => {
  const [form, setForm] = React.useState({
    parent: '',
    status: '',
    athleteNumber: '',
  });

  React.useEffect(() => {
    if (dues) {
      setForm({
        parent: dues.parent || '',
        status: dues.status || '',
        athleteNumber: dues.athleteNumber || '',
      });
    }
  }, [dues, open]);

  const handleDropdownChange = (val) => {
    setForm({ ...form, status: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave && onSave({ ...dues, ...form });
  };

  if (!open) return null;
  return (
    <div className="duesedit-modal__overlay">
      <div className="duesedit-modal">
        <button className="duesedit-modal__close" onClick={onClose}>&times;</button>
        <h2>Aidat Düzenle</h2>
        <form className="duesedit-modal__content" onSubmit={handleSubmit}>
          <div className="duesedit-modal__field">
            <label>Veli Ad Soyad:</label>
            <input name="parent" type="text" value={form.parent} readOnly />
          </div>
          <div className="duesedit-modal__field">
            <label>Aidat Durumu:</label>
            <CustomDropdown
              options={statusOptions}
              value={form.status}
              onChange={handleDropdownChange}
              placeholder="Durum seçiniz"
            />
          </div>
          <div className="duesedit-modal__field">
            <label>Sporcu Numarası:</label>
            <input name="athleteNumber" type="text" value={form.athleteNumber} readOnly />
          </div>
          <button type="submit" className="duesedit-modal__save">Kaydet</button>
        </form>
      </div>
    </div>
  );
};

export default DuesEditModal; 