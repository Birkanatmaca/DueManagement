import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import CrudTableCard from '../../component/CrudTableCard';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import AthleteDetailModal from '../../component/AthleteDetailModal';
import AthleteEditModal from '../../component/AthleteEditModal';
import ToastMessage from '../../component/ToastMessage';
import ConfirmModal from '../../component/ConfirmModal';
import { listChildren, updateChild, deleteChild, addChild } from '../../services/adminServices';

const Athletes = () => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAthlete, setEditAthlete] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [athleteToDelete, setAthleteToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  React.useEffect(() => {
    // TODO: Replace with real token from auth context or storage
    const token = localStorage.getItem('token') || 'demo-token';
    listChildren(token)
      .then(res => {
        // Adjust this mapping according to your API response structure
        if (res && res.data && Array.isArray(res.data.response?.children)) {
          setAthletes(res.data.response.children.map(child => ({
            id: child.id,
            name: child.name + (child.surname ? ' ' + child.surname : ''),
            number: child.athlete_number,
            dogumTarihi: child.birth_date,
            parent_id: child.parent_id, // parent_id'yi ekle
          })));
        } else {
          setAthletes([]);
        }
      })
      .catch(() => setAthletes([]));
  }, []);

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(search.toLowerCase()) ||
      (athlete.number && athlete.number.toString().includes(search))
  );

  const iconSize = isMobile ? 20 : 22;

  const handleEditSave = async (form) => {
    const token = localStorage.getItem('token') || 'demo-token';
    // Find the athlete being edited to get the id
    const editingAthlete = athletes.find(a => a.number === form.numara || a.id === form.numara);
    if (!editingAthlete) return;
    // Split ad/soyad for API
    const name = form.ad;
    const surname = form.soyad;
    const birth_date = form.dogumTarihi;
    const child_id = editingAthlete.id;
    await updateChild(token, child_id, name, surname, birth_date);
    // Refresh list
    listChildren(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.children)) {
          setAthletes(res.data.response.children.map(child => ({
            id: child.id,
            name: child.name + (child.surname ? ' ' + child.surname : ''),
            number: child.athlete_number,
            dogumTarihi: child.birth_date,
          })));
        } else {
          setAthletes([]);
        }
      })
      .catch(() => setAthletes([]));
    setEditModalOpen(false);
    setToastMsg('Sporcu bilgileri başarıyla güncellendi.');
    setToastOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!athleteToDelete) return;
    const token = localStorage.getItem('token') || 'demo-token';
    const child_id = athleteToDelete.id;
    await deleteChild(token, child_id);
    // Refresh list
    listChildren(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.children)) {
          setAthletes(res.data.response.children.map(child => ({
            id: child.id,
            name: child.name + (child.surname ? ' ' + child.surname : ''),
            number: child.athlete_number,
            dogumTarihi: child.birth_date,
          })));
        } else {
          setAthletes([]);
        }
      })
      .catch(() => setAthletes([]));
    setDeleteConfirmOpen(false);
    setToastMsg('Sporcu başarıyla silindi.');
    setToastOpen(true);
    setAthleteToDelete(null);
  };

  const handleAddSave = async (form) => {
    const token = localStorage.getItem('token') || 'demo-token';
    const name = form.ad;
    const surname = form.soyad;
    const birth_date = form.dogumTarihi;
    await addChild(token, name, surname, birth_date);
    // Refresh list
    listChildren(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.children)) {
          setAthletes(res.data.response.children.map(child => ({
            id: child.id,
            name: child.name + (child.surname ? ' ' + child.surname : ''),
            number: child.athlete_number,
            dogumTarihi: child.birth_date,
          })));
        } else {
          setAthletes([]);
        }
      })
      .catch(() => setAthletes([]));
    setAddModalOpen(false);
    setToastMsg('Sporcu başarıyla eklendi.');
    setToastOpen(true);
  };

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
          backgroundColor: '#0f172a',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700, color: '#ffffff' }}>Sporcu Yönetimi</h1>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Sporcu adı veya numarası ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 18px',
              borderRadius: 24,
              border: '1.5px solid #475569',
              width: 320,
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              outline: 'none',
              transition: 'border 0.2s, box-shadow 0.2s',
              background: '#1e293b',
              color: '#ffffff',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #3b82f6'}
            onBlur={e => e.target.style.border = '1.5px solid #475569'}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button
            style={{
              background: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '10px 28px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(67,160,71,0.12)',
              transition: 'background 0.18s',
            }}
            onClick={() => setAddModalOpen(true)}
          >
            Sporcu Ekle
          </button>
        </div>
        <CrudTableCard
          title=""
          columns={[
            { label: 'Ad Soyad', key: 'name', align: 'left' },
            { label: 'Sporcu Numarası', key: 'number', align: 'right' },
            { label: 'İşlemler', key: 'actions', align: 'left', render: (_, row, { onView, onEdit, onDelete }) => (
              <div style={{ display: 'flex', gap: isMobile ? 4 : 8, justifyContent: 'center' }}>
                <button title="Görüntüle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} onClick={() => onView && onView(row)}><MdVisibility size={iconSize} /></button>
                <button title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43a047' }} onClick={() => onEdit && onEdit(row)}><MdEdit size={iconSize} /></button>
                <button title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935' }} onClick={() => onDelete && onDelete(row)}><MdDelete size={iconSize} /></button>
              </div>
            ) },
          ]}
          data={filteredAthletes}
          tableClassName="athletes-table"
          onView={(row) => {
            setSelectedAthlete({
              ad: row.name.split(' ')[0] || '',
              soyad: row.name.split(' ').slice(1).join(' ') || '',
              numara: row.number,
              dogumTarihi: row.dogumTarihi,
              parent_id: row.parent_id, // parent_id'yi ekle
              veliAd: '', // API'den veli adı alınırsa buraya eklenmeli
              veliTelefon: '', // API'den veli telefon alınırsa buraya eklenmeli
            });
            setModalOpen(true);
          }}
          onEdit={(row) => {
            // Convert ISO date to 'YYYY-MM-DD' for input type='date'
            let dogumTarihi = row.dogumTarihi;
            if (dogumTarihi && dogumTarihi.includes('T')) {
              dogumTarihi = dogumTarihi.split('T')[0];
            }
            setEditAthlete({
              ad: row.name.split(' ')[0] || '',
              soyad: row.name.split(' ').slice(1).join(' ') || '',
              numara: row.number,
              dogumTarihi,
              veliAd: '', // API'den veli adı alınırsa buraya eklenmeli
              veliTelefon: '', // API'den veli telefon alınırsa buraya eklenmeli
            });
            setEditModalOpen(true);
          }}
          onDelete={(row) => {
            setAthleteToDelete(row);
            setDeleteConfirmOpen(true);
          }}
        />
        <AthleteDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          athlete={selectedAthlete || {}}
        />
        <AthleteEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          athlete={editAthlete || {}}
          onSave={handleEditSave}
        />
        <AthleteEditModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          athlete={{ ad: '', soyad: '', dogumTarihi: '' }}
          onSave={handleAddSave}
          isAdding={true}
        />
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Sporcuyu silmek istiyor musun?"
          description="Bu işlem geri alınamaz."
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeleteConfirmOpen(false); setAthleteToDelete(null); }}
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

export default Athletes; 