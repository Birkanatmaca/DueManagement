import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import CrudTableCard from '../../component/CrudTableCard';
import { MdVisibility, MdEdit, MdDelete, MdCheckCircle, MdCancel } from 'react-icons/md';
import ToastMessage from '../../component/ToastMessage';
import ConfirmModal from '../../component/ConfirmModal';
import { listParents, updateParent, listChildren, matchChildToParentAdmin, unmatchChildFromParentAdmin, getParentDetails, addParent, deleteParent } from '../../services/adminServices';
import ParentDetailModal from '../../component/ParentDetailModal';
import ParentEditModal from '../../component/ParentEditModal';

// Yeni Parent modal bileşenleri
// (Buradaki eski ParentDetailModal ve ParentEditModal tanımlarını kaldırıyorum)

const Parents = () => {
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
  const [selectedParent, setSelectedParent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editParent, setEditParent] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [parents, setParents] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Tekrarlanan liste yenileme kodunu fonksiyona al
  const refreshParentsList = () => {
    const token = localStorage.getItem('token') || 'demo-token';
    listParents(token)
      .then(res => {
        if (res && res.data && Array.isArray(res.data.response?.parents)) {
          setParents(res.data.response.parents.map(parent => ({
            id: parent.id || parent.parent_id,
            name: parent.name,
            surname: parent.last_name || parent.surname,
            phone: parent.phone,
            email: parent.email,
            child: parent.child_name || '',
            matched_child_count: parent.matched_child_count,
            children: parent.children // getParentDetails ile gelirse
          })));
        } else {
          setParents([]);
        }
      })
      .catch(() => setParents([]))
      .finally(() => {
        // setLoading(false); // This line was removed as per the edit hint.
      });
  };

  React.useEffect(() => {
    refreshParentsList();
  }, []);

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(search.toLowerCase()) ||
      parent.surname.toLowerCase().includes(search.toLowerCase()) ||
      (parent.child && parent.child.toLowerCase().includes(search.toLowerCase()))
  );

  const iconSize = isMobile ? 20 : 24;

  const handleEditSave = async (form, shouldRefresh = false) => {
    const token = localStorage.getItem('token') || 'demo-token';
    // Find the parent being edited to get the id
    const editingParent = parents.find(p => p.email === form.email && p.name === form.name);
    if (!editingParent) return;
    const parent_id = editingParent.id;
    const name = form.name;
    const last_name = form.surname;
    const email = form.email;
    const phone = form.phone;
    
    // Şifre alanı boşsa undefined gönder (şifre değişmesin)
    // Şifre alanı doluysa yeni şifreyi gönder
    const password = form.password && form.password.trim() !== '' ? form.password : undefined;
    
    await updateParent(token, parent_id, name, last_name, email, phone, password);
    
    // Eğer çocuk eşleştirme işlemi yapıldıysa parent listesini yenile
    if (shouldRefresh) {
      refreshParentsList();
      setToastMsg('Veli bilgileri ve çocuk eşleştirmeleri başarıyla güncellendi.');
    } else {
      setToastMsg('Veli bilgileri başarıyla güncellendi.');
    }
    
    setEditModalOpen(false);
    setToastOpen(true);
  };

  // Veli ekle
  const handleAddSave = async (form) => {
    const token = localStorage.getItem('token') || 'demo-token';
    await addParent(token, form.name, form.surname, form.email, form.phone, form.password || '');
    refreshParentsList();
    setAddModalOpen(false);
    setToastMsg('Veli başarıyla eklendi.');
    setToastOpen(true);
  };

  // Veli sil
  const handleDeleteConfirm = async () => {
    if (!selectedParent) return;
    const token = localStorage.getItem('token') || 'demo-token';
    await deleteParent(token, selectedParent.id);
    refreshParentsList();
    setDeleteConfirmOpen(false);
    setToastMsg('Veli başarıyla silindi.');
    setToastOpen(true);
    setSelectedParent(null);
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
        }}
      >
        <h1 style={{ marginBottom: 32, textAlign: 'center', fontWeight: 700 }}>Veli Yönetimi</h1>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Veli, öğrenci adı veya numarası ile ara..."
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
            Veli Ekle
          </button>
        </div>
        <CrudTableCard
          title=""
          columns={[
            { label: 'Veli Adı Soyadı', key: 'fullName', align: 'left', style: { flex: 1 }, render: (v, row) => `${row.name} ${row.surname}` },
            { label: 'Çocukla Eşleşme Durumu', key: 'matchStatus', align: 'center', style: { flex: 1 }, render: (v, row) => {
              // row.children getParentDetails ile geliyorsa onu kullan
              const hasMatch = Array.isArray(row.children) ? row.children.length > 0 : Number(row.matched_child_count) > 0;
              const iconSize = window.innerWidth > 700 ? 32 : 20;
              if (hasMatch) {
                return <span style={{ color: '#43a047', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdCheckCircle style={{ marginRight: 4 }} size={iconSize} /> </span>;
              } else {
                return <span style={{ color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdCancel style={{ marginRight: 4 }} size={iconSize} /> </span>;
              }
            } },
            { label: 'İşlemler', key: 'actions', align: 'center', render: (_, row, { onView, onEdit, onDelete }) => (
              <div style={{ display: 'flex', gap: isMobile ? 4 : 8, justifyContent: 'center' }}>
                <button title="Görüntüle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a237e' }} onClick={() => onView && onView(row)}><MdVisibility size={iconSize} /></button>
                <button title="Düzenle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43a047' }} onClick={() => onEdit && onEdit(row)}><MdEdit size={iconSize} /></button>
                <button title="Sil" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935' }} onClick={() => onDelete && onDelete(row)}><MdDelete size={iconSize} /></button>
              </div>
            ) },
          ]}
          data={filteredParents}
          tableClassName="parents-table"
          onView={(row) => {
            setSelectedParent(row);
            setModalOpen(true);
          }}
          onEdit={(row) => {
            setEditParent(row);
            setEditModalOpen(true);
          }}
          onDelete={(row) => {
            setSelectedParent(row);
            setDeleteConfirmOpen(true);
          }}
        />
        <ParentDetailModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          parent={selectedParent || {}}
          getParentDetails={getParentDetails}
        />
        <ParentEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          parent={editParent || {}}
          onSave={handleEditSave}
          listChildren={listChildren}
          getParentDetails={getParentDetails}
          matchChildToParentAdmin={matchChildToParentAdmin}
          unmatchChildFromParentAdmin={unmatchChildFromParentAdmin}
        />
        <ParentEditModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          parent={{ name: '', surname: '', phone: '', email: '', child: '', password: '' }}
          onSave={handleAddSave}
          listChildren={listChildren}
          getParentDetails={getParentDetails}
          matchChildToParentAdmin={matchChildToParentAdmin}
          unmatchChildFromParentAdmin={unmatchChildFromParentAdmin}
          isAddMode={true}
        />
        <ConfirmModal
          open={deleteConfirmOpen}
          title="Veliyi silmek istiyor musun?"
          description="Bu işlem geri alınamaz."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmOpen(false)}
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

export default Parents; 