import React, { useState } from 'react';
import './dues.scss';
import CustomDropdown from '../../components/CustomDropdown.jsx'; // YENİ: Özel dropdown bileşeni import edildi
import '../../components/customdropdown.scss'; // YENİ: Özel dropdown stilleri import edildi
import ErrorToast from '../../components/ErrorToast';
import { listDues, addDue, updateDue, deleteDue, getDue } from './dues.js';

const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const currentYear = new Date().getFullYear();

// Add back filterOptions for the dropdown
const filterOptions = [
  { value: 'all', label: 'Hepsi' },
  { value: 'paid', label: 'Ödeyenler' },
  { value: 'unpaid', label: 'Ödemeyenler' },
];

const Dues = () => {
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
  const [year, setYear] = useState(currentYear);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showView, setShowView] = useState(false);
  const [viewDue, setViewDue] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editDue, setEditDue] = useState(null);
  const [dues, setDues] = useState([]);
  const duesPerPage = 20;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const filteredDues = dues.filter(d => {
    const matchesFilter = filter === 'all' ? true : filter === 'paid' ? d.paid : !d.paid;
    const matchesSearch = searchTerm === '' ||
      d.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.playerSurname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.playerNo.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const pageCount = Math.ceil(filteredDues.length / duesPerPage);
  const start = (page - 1) * duesPerPage;
  const currentDues = filteredDues.slice(start, start + duesPerPage);

  const handlePrevMonth = () => setMonthIdx(m => (m === 0 ? 11 : m - 1));
  const handleNextMonth = () => setMonthIdx(m => (m === 11 ? 0 : m + 1));
  const handlePrevYear = () => setYear(y => y - 1);
  const handleNextYear = () => setYear(y => y + 1);
  const handleSearch = (e) => { setSearchTerm(e.target.value); setPage(1); };

  // View a single due by id
  const handleView = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDue(id);
      if (res.success) {
        const d = res.data;
        setViewDue({
          id: d.due_id,
          playerName: d.child_name,
          playerSurname: d.child_surname,
          parentName: d.parent_name,
          playerNo: d.child_no,
          birthDate: d.child_birthdate,
          paid: d.is_paid,
          amount: d.amount,
          month: d.month,
          year: d.year,
          due_date: d.due_date,
        });
        setShowView(true);
      } else {
        setError(res.error || 'Aidat detayı alınamadı.');
      }
    } catch (e) {
      setError('Aidat detayı alınamadı.');
    }
    setLoading(false);
  };

  const handleCloseView = () => {
    setShowView(false);
    setViewDue(null);
  };

  const handleEdit = (id) => {
    const due = dues.find(d => d.id === id);
    setEditDue({ ...due });
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditDue(null);
  };

  const handleSaveEdit = async () => {
    if (editDue) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const payload = {
        due_id: editDue.id,
        amount: editDue.amount,
        due_date: editDue.due_date || new Date(editDue.year || year, editDue.month || monthIdx, 1).toISOString().slice(0, 10),
        is_paid: editDue.paid,
      };
      const res = await updateDue(payload);
      setLoading(false);
      if (res.success) {
        setSuccess('Aidat başarıyla güncellendi.');
        fetchDues();
        setShowEdit(false);
        setEditDue(null);
      } else {
        setError(res.error || 'Aidat güncellenemedi.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditDue(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new due (example, you may want to add a modal/form for this)
  const handleAddDue = async (newDue) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await addDue(newDue);
    setLoading(false);
    if (res.success) {
      setSuccess('Aidat başarıyla eklendi.');
      fetchDues();
    } else {
      setError(res.error || 'Aidat eklenemedi.');
    }
  };

  // Delete due (example, you may want to add a delete button and confirmation)
  const handleDeleteDue = async (dueId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await deleteDue(dueId);
    setLoading(false);
    if (res.success) {
      setSuccess('Aidat başarıyla silindi.');
      fetchDues();
    } else {
      setError(res.error || 'Aidat silinemedi.');
    }
  };

  // Fetch dues from backend (with month/year)
  const fetchDues = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDues({ month: monthIdx + 1, year });
      if (res.success) {
        const duesArray = Array.isArray(res.data) ? res.data : (res.data.dues || []);
        setDues(duesArray.map((d) => ({
          id: d.due_id,
          playerName: d.child_name,
          playerSurname: d.child_surname,
          parentName: d.parent_name,
          playerNo: d.athlete_number,
          birthDate: d.child_birthdate,
          paid: d.status === 'Ödendi' || d.is_paid,
          amount: d.amount,
          month: d.month,
          year: d.year,
          due_date: d.due_date,
        })));
      } else {
        setError(res.error || 'Aidat verileri alınamadı.');
      }
    } catch (e) {
      setError('Aidat verileri alınamadı.');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchDues();
  }, []);

  return (
    <div className="dues-card">
      {loading && <div className="loading">Yükleniyor...</div>}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />} 
      {success && <ErrorToast message={success} type="success" onClose={() => setSuccess(null)} />} 
        {/* Header - Değişiklik yok */}
        <div className="dues-header">
            <div className="month-switch">
                <button className="month-btn" onClick={handlePrevMonth} aria-label="Önceki Ay">&#8592;</button>
                <span className="month-label">{months[monthIdx]}</span>
                <button className="month-btn" onClick={handleNextMonth} aria-label="Sonraki Ay">&#8594;</button>
            </div>
            <div className="year-switch">
                <button className="year-btn" onClick={handlePrevYear} aria-label="Önceki Yıl">&#8592;</button>
                <span className="year-label">{year}</span>
                <button className="year-btn" onClick={handleNextYear} aria-label="Sonraki Yıl">&#8594;</button>
            </div>
        </div>

        {/* DEĞİŞTİ: Filtreleme bölümü CustomDropdown ile güncellendi */}
        <div className="dues-filters-select">
            <CustomDropdown
              options={filterOptions}
              selectedValue={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1); // Sayfalamayı sıfırla
              }}
              placeholder="Filtrele"
            />
        </div>

        {/* Search - Değişiklik yok */}
        <div className="dues-search">
            <input
              type="text"
              placeholder="Sporcu adı, veli adı veya sporcu no ile ara..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
        </div>

        {/* Dues List - Değişiklik yok */}
        <ul className="dues-list">
            <li className="dues-list-header">
                <span className="col-name">Sporcu Ad Soyad</span>
                <span className="col-parent">Veli Ad Soyad</span>
                <span className="col-no">Sporcu No</span>
                <span className="col-status">Aidat Bilgisi</span>
                <span className="col-actions">İşlemler</span>
            </li>
            {currentDues.map(d => (
                <li key={d.id} className="dues-list-row">
                    <span className="col-name">{d.playerName} {d.playerSurname}</span>
                    <span className="col-parent">{d.parentName}</span>
                    <span className="col-no">{d.playerNo}</span>
                    <span className={d.paid ? 'paid col-status' : 'not-paid col-status'}>{d.paid ? 'Ödedi' : 'Ödemedi'}</span>
                    <span className="dues-actions col-actions">
                        <button className="view-btn" onClick={() => handleView(d.id)}>Görüntüle</button>
                        <button className="edit-btn" onClick={() => handleEdit(d.id)}>Düzenle</button>
                    </span>
                </li>
            ))}
        </ul>
        
        {/* Pagination - Değişiklik yok */}
        <div className="dues-pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Önceki</button>
            <span>{page} / {pageCount}</span>
            <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Sonraki</button>
        </div>

        {/* View Modal - Değişiklik yok */}
        {showView && viewDue && (
            <div className="modal-overlay" onClick={handleCloseView}>
                <div className="view-due-modal" onClick={e => e.stopPropagation()}>
                    <button type="button" className="close-x" onClick={handleCloseView}>&times;</button>
                    <h3>Aidat Detayları</h3>
                    <div className="view-info-grid">
                        <div className="view-info-row">
                            <span className="info-label">Sporcu Adı Soyadı:</span>
                            <span className="info-value">{viewDue.playerName} {viewDue.playerSurname}</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Veli Adı Soyadı:</span>
                            <span className="info-value">{viewDue.parentName}</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Sporcu Numarası:</span>
                            <span className="info-value">{viewDue.playerNo}</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Sporcu Doğum Tarihi:</span>
                            <span className="info-value">{viewDue.birthDate}</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Aidat Ayı:</span>
                            <span className="info-value">{months[monthIdx]} {year}</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Aidat Ücreti:</span>
                            <span className="info-value">{viewDue.amount.toFixed(2)} TL</span>
                        </div>
                        <div className="view-info-row">
                            <span className="info-label">Ödeme Durumu:</span>
                            <span className={`info-value ${viewDue.paid ? 'paid' : 'not-paid'}`}>
                                {viewDue.paid ? 'ÖDENDİ' : 'ÖDENMEDİ'}
                            </span>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="close-btn" onClick={handleCloseView}>
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Modal - Değişiklik yok */}
        {showEdit && editDue && (
            <div className="modal-overlay" onClick={handleCloseEdit}>
                <div className="edit-due-modal" onClick={e => e.stopPropagation()}>
                    <button type="button" className="close-x" onClick={handleCloseEdit}>&times;</button>
                    <h3>Aidat Düzenle</h3>
                    <div className="edit-form">
                        <div className="form-group">
                            <label>Sporcu Adı:</label>
                            <input
                                type="text"
                                value={editDue.playerName}
                                onChange={(e) => handleInputChange('playerName', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Sporcu Soyadı:</label>
                            <input
                                type="text"
                                value={editDue.playerSurname}
                                onChange={(e) => handleInputChange('playerSurname', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Veli Adı Soyadı:</label>
                            <input
                                type="text"
                                value={editDue.parentName}
                                onChange={(e) => handleInputChange('parentName', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Sporcu Numarası:</label>
                            <input
                                type="number"
                                value={editDue.playerNo}
                                onChange={(e) => handleInputChange('playerNo', parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Doğum Tarihi:</label>
                            <input
                                type="date"
                                value={editDue.birthDate}
                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Aidat Ücreti (TL):</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editDue.amount}
                                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                className="form-input"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ödeme Durumu:</label>
                            <select
                                value={editDue.paid ? 'paid' : 'unpaid'}
                                onChange={(e) => handleInputChange('paid', e.target.value === 'paid')}
                                className="form-select"
                            >
                                <option value="paid">Ödendi</option>
                                <option value="unpaid">Ödenmedi</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="save-btn" onClick={handleSaveEdit}>
                            Kaydet
                        </button>
                        <button className="cancel-btn" onClick={handleCloseEdit}>
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Dues;