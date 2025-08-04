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
            children: parent.children
          })));
        } else {
          setParents([]);
        }
      })
      .catch(() => setParents([]));
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
    const editingParent = parents.find(p => p.email === form.email && p.name === form.name);
    if (!editingParent) return;
    const parent_id = editingParent.id;
    const name = form.name;
    const last_name = form.surname;
    const email = form.email;
    const phone = form.phone;
    const password = form.password && form.password.trim() !== '' ? form.password : undefined;
    
    await updateParent(token, parent_id, name, last_name, email, phone, password);
    
    if (shouldRefresh) {
      refreshParentsList();
      setToastMsg('Veli bilgileri ve çocuk eşleştirmeleri başarıyla güncellendi.');
    } else {
      setToastMsg('Veli bilgileri başarıyla güncellendi.');
    }
    
    setEditModalOpen(false);
    setToastOpen(true);
  };

  const handleAddSave = async (form) => {
    const token = localStorage.getItem('token') || 'demo-token';
    await addParent(token, form.name, form.surname, form.email, form.phone, form.password || '');
    refreshParentsList();
    setAddModalOpen(false);
    setToastMsg('Veli başarıyla eklendi.');
    setToastOpen(true);
  };

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
          backgroundColor: '#0f172a',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ 
          marginBottom: 32, 
          textAlign: 'center', 
          fontWeight: 700,
          color: '#ffffff'
        }}>
          Veli Yönetimi
        </h1>
        <div style={{ 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Veli, öğrenci adı veya numarası ile ara..."
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: 16
        }}>
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
            { 
              label: 'Adı-Soyadı', 
              key: 'fullName', 
              align: 'left', 
              style: { 
                width: '40%',
                minWidth: '150px'
              }, 
              render: (v, row) => (
                <div style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500'
                }}>
                  {`${row.name} ${row.surname}`}
                </div>
              )
            },
            { 
              label: 'Eşleşme Durumu', 
              key: 'matchStatus', 
              align: 'center', 
              style: { 
                width: '30%',
                minWidth: '120px'
              }, 
              render: (v, row) => {
                const hasMatch = Array.isArray(row.children) ? row.children.length > 0 : Number(row.matched_child_count) > 0;
                const iconSize = isMobile ? 20 : 24;
                if (hasMatch) {
                  return (
                    <span style={{ 
                      color: '#10b981', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <MdCheckCircle size={iconSize} />
                    </span>
                  );
                } else {
                  return (
                    <span style={{ 
                      color: '#ef4444', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <MdCancel size={iconSize} />
                    </span>
                  );
                }
              }
            },
            { 
              label: 'İşlemler', 
              key: 'actions', 
              align: 'center',
              style: {
                width: '30%',
                minWidth: '100px'
              },
              render: (_, row, { onView, onEdit, onDelete }) => (
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? 4 : 8, 
                  justifyContent: 'center',
                  flexWrap: 'nowrap'
                }}>
                  <button 
                    title="Görüntüle" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#3b82f6',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                    onClick={() => onView && onView(row)}
                  >
                    <MdVisibility size={iconSize} />
                  </button>
                  <button 
                    title="Düzenle" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#10b981',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                    onClick={() => onEdit && onEdit(row)}
                  >
                    <MdEdit size={iconSize} />
                  </button>
                  <button 
                    title="Sil" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#ef4444',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                    onClick={() => onDelete && onDelete(row)}
                  >
                    <MdDelete size={iconSize} />
                  </button>
                </div>
              )
            },
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