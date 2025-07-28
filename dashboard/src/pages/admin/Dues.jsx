import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import CrudTableCard from '../../component/CrudTableCard';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import ToastMessage from '../../component/ToastMessage';
import ConfirmModal from '../../component/ConfirmModal';
import CustomDropdown from '../../component/CustomDropdown';
import DuesDetailModal from '../../component/DuesDetailModal';
import DuesEditModal from '../../component/DuesEditModal';
import {
  listDues,
  addDue,
  updateDue,
  deleteDue,
  getDue
} from '../../services/adminServices';

const Dues = () => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDues, setSelectedDues] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDues, setEditDues] = useState(null);
  const [duesList, setDuesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const monthOptions = [
    { value: '01', label: 'Ocak' },
    { value: '02', label: 'Şubat' },
    { value: '03', label: 'Mart' },
    { value: '04', label: 'Nisan' },
    { value: '05', label: 'Mayıs' },
    { value: '06', label: 'Haziran' },
    { value: '07', label: 'Temmuz' },
    { value: '08', label: 'Ağustos' },
    { value: '09', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' },
  ];
  const yearOptions = Array.from({length: 9}, (_, i) => {
    const year = 2022 + i;
    return { value: String(year), label: String(year) };
  });
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[new Date().getMonth()].value);
  const [selectedYear, setSelectedYear] = useState(yearOptions.find(y => y.value === String(new Date().getFullYear()))?.value || '2024');

  // API'den aidatları çek
  const fetchDues = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await listDues(token, Number(selectedMonth), Number(selectedYear));
      let duesArr = [];
      if (res.data && res.data.response && Array.isArray(res.data.response.dues)) {
        duesArr = res.data.response.dues.map((item) => ({
          id: item.id || item.due_id,
          parent: (item.parent_name && item.parent_surname) ? `${item.parent_name} ${item.parent_surname}` : '',
          status: item.status || (item.is_paid ? 'Ödendi' : 'Ödenmedi'),
          athlete: (item.child_name && item.child_surname) ? `${item.child_name} ${item.child_surname}` : '',
          athleteNumber: item.athlete_number || '',
          athleteBirth: '', // API'de yok, boş bırak
          amount: item.amount,
          due_date: item.due_date,
          paid_at: item.paid_at,
          child_id: item.child_id,
          parent_id: item.parent_id,
        }));
      }
      setDuesList(duesArr);
    } catch (err) {
      setDuesList([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDues();
    // eslint-disable-next-line
  }, [selectedMonth, selectedYear]);

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      await deleteDue(token, deleteId);
      setToastMsg('Aidat kaydı başarıyla silindi.');
      setToastOpen(true);
      fetchDues();
    } catch (err) {
      setToastMsg('Silme işlemi başarısız.');
      setToastOpen(true);
    }
    setDeleteId(null);
  };

  const handleEditSave = async (form) => {
    setEditModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      // Aidat tutarını ve ödeme durumunu güncelle
      await updateDue(token, form.id, form.amount, form.status === 'Ödendi');
      setToastMsg('Aidat bilgileri başarıyla kaydedildi.');
      setToastOpen(true);
      fetchDues();
    } catch (err) {
      setToastMsg('Güncelleme başarısız.');
      setToastOpen(true);
    }
  };

  const filteredDues = duesList.filter(
    (item) =>
      (item.parent?.toLowerCase().includes(search.toLowerCase()) ||
        item.status?.toLowerCase().includes(search.toLowerCase()))
  );

  const iconSize = isMobile ? 20 : 24;

  return (
    <>
      <Sidebar
        expanded={isMobile ? mobileOpen : sidebarExpanded}
        setExpanded={setSidebarExpanded}
        mobileOpen={mobileOpen}
        onToggle={() => setMobileOpen(false)}
      />
      <Navbar
        title="Admin Panel"
        onMenuClick={() => setMobileOpen(true)}
        onMenuClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
      />
      <div
        style={{
          marginLeft: isMobile ? 0 : (sidebarExpanded ? 240 : 80),
          marginTop: 64,
          padding: 24,
          transition: 'margin-left 0.2s',
        }}
      >
        <div className="dues-header">
          <div className="dues-header__title">Aidat Yönetimi</div>
          <div className="dues-filter-bar">
            <CustomDropdown
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              placeholder="Ay seç"
              style={{ minWidth: 120 }}
            />
            <CustomDropdown
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Yıl seç"
              style={{ minWidth: 100 }}
            />
            <button
              style={{
                padding: '8px 22px',
                borderRadius: 20,
                border: 'none',
                background: '#1a237e',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                marginLeft: 10,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(26,35,126,0.08)',
                transition: 'background 0.18s',
              }}
              onClick={fetchDues}
            >
              ARA
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Veli adı veya aidat durumu ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 18px',
              borderRadius: 24,
              border: '1.5px solid #d1d5db',
              width: 320,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(26,35,126,0.06)',
              outline: 'none',
              transition: 'border 0.2s, box-shadow 0.2s',
              background: '#fafbff',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #1a237e'}
            onBlur={e => e.target.style.border = '1.5px solid #d1d5db'}
          />
        </div>
        <CrudTableCard
          title=""
          columns={[
            { label: 'Sporcu Adı Soyadı', key: 'athlete', align: 'left', style: { flex: 1 } },
            { label: 'Aidat Durumu', key: 'status', align: 'left', style: { flex: 1 }, render: (v) => (
              <span className={`dues-status-badge ${v === 'Ödendi' ? 'paid' : 'unpaid'}`}>{v}</span>
            ) },
            { label: 'İşlemler', key: 'actions', align: 'left', render: (_, row, { onView, onEdit, onDelete }) => (
              <div style={{ display: 'flex', gap: isMobile ? 4 : 8, justifyContent: 'center' }}>
                <button title="Görüntüle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a237e' }} onClick={() => { setSelectedDues(row); setDetailModalOpen(true); }}><MdVisibility size={iconSize} /></button>
                <button title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43a047' }} onClick={() => { setEditDues(row); setEditModalOpen(true); }}><MdEdit size={iconSize} /></button>
                <button title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935' }} onClick={() => { setDeleteConfirmOpen(true); setDeleteId(row.id); }}><MdDelete size={iconSize} /></button>
              </div>
            ) },
          ]}
          data={filteredDues}
          tableClassName="dues-table"
        />
        <DuesDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          dues={selectedDues || {}}
        />
        <DuesEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          dues={editDues || {}}
          onSave={handleEditSave}
        />
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Aidat kaydını silmek istiyor musun?"
          description="Bu işlem geri alınamaz."
          onConfirm={handleDelete}
          onCancel={() => { setDeleteConfirmOpen(false); setDeleteId(null); }}
        />
        <ToastMessage
          open={toastOpen}
          message={toastMsg}
          type="success"
          onClose={() => setToastOpen(false)}
        />
      </div>
    </>
  );
};

export default Dues; 