import React, { useState, useEffect } from 'react';
import './parents.scss';
import ErrorToast from '../components/ErrorToast';
import { listParents, addParent, updateParent, deleteParent, getParentDetails } from '../api/parents';
import { listPlayers } from '../api/players';
import { matchChildToParentAdmin, unmatchChildFromParent } from '../api/parents';

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editParent, setEditParent] = useState(null);
  const [showView, setShowView] = useState(false);
  const [viewParent, setViewParent] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    contact: '',
    password: ''
  });
  const [formChanged, setFormChanged] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteParent, setDeleteParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const parentsPerPage = 20;
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');
  const [allChildren, setAllChildren] = useState([]);
  const [childSearch, setChildSearch] = useState('');
  const [childLoading, setChildLoading] = useState(false);
  const [childError, setChildError] = useState('');

  // Veliye bağlı çocuklar (editParent'dan değil, getParentDetails ile güncel alınmalı)
  const [parentChildren, setParentChildren] = useState([]);
  const [parentChildrenLoading, setParentChildrenLoading] = useState(false);
  const [parentChildrenError, setParentChildrenError] = useState('');

  // Hata mesajı otomatik kaybolsun
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Sadece parents tablosundan veri çek
  const fetchParents = async () => {
    setLoading(true);
    try {
      const result = await listParents();
      let allParents = [];
      if (result.success && result.data && Array.isArray(result.data.parents)) {
        allParents = result.data.parents.map((p, i) => ({
          id: p.id || i + 1,
          name: p.name || '',
          surname: p.last_name || p.surname || '',
          email: p.email || '',
          contact: p.phone || p.contact || '',
          password: '',
          matched_child_count: p.matched_child_count || 0,
          status: (p.matched_child_count && p.matched_child_count > 0) ? 'Eşleşmiş' : 'Beklemede',
          source: 'parents',
        }));
      }
      if (allParents.length === 0) {
        const testParents = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Test Veli ${i + 1}`,
          surname: `Test Soyad ${i + 1}`,
          email: `test${i + 1}@example.com`,
          contact: `05${Math.floor(100000000 + Math.random() * 899999999)}`,
          password: 'test123',
          matched_child_count: 0,
          status: 'Beklemede',
          source: 'test',
        }));
        allParents = testParents;
      }
      setParents(allParents);
    } catch (err) {
      setErrorMessage('Veliler yüklenemedi.');
      const testParents = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Test Veli ${i + 1}`,
        surname: `Test Soyad ${i + 1}`,
        email: `test${i + 1}@example.com`,
        contact: `05${Math.floor(100000000 + Math.random() * 899999999)}`,
        password: 'test123',
        matched_child_count: 0,
        status: 'Beklemede',
        source: 'test',
      }));
      setParents(testParents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Çocukları getir (edit modalı açıldığında)
  useEffect(() => {
    if (showEdit && editParent) {
      setChildLoading(true);
      listPlayers().then(result => {
        if (result.success && result.data && Array.isArray(result.data.children)) {
          setAllChildren(result.data.children);
        } else {
          setAllChildren([]);
          setChildError('Çocuklar yüklenemedi.');
        }
      }).catch(() => setChildError('Çocuklar yüklenemedi.'))
        .finally(() => setChildLoading(false));
    }
  }, [showEdit, editParent]);

  // Edit modalı açıldığında parent detayını çek
  useEffect(() => {
    if (showEdit && editParent) {
      setParentChildrenLoading(true);
      getParentDetails(editParent.id).then(result => {
        if (result.success && result.data && Array.isArray(result.data.children)) {
          setParentChildren(result.data.children);
        } else {
          setParentChildren([]);
          setParentChildrenError('Veli çocukları yüklenemedi.');
        }
      }).catch(() => setParentChildrenError('Veli çocukları yüklenemedi.'))
        .finally(() => setParentChildrenLoading(false));
    }
  }, [showEdit, editParent]);

  // Filtrelenmiş, sıralanmış ve sayfalı veliler
  const filteredParents = parents
    .filter(p =>
      (p.name + " " + p.surname).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Önce ad'a göre sırala
      const nameComparison = a.name.localeCompare(b.name, 'tr');
      if (nameComparison !== 0) return nameComparison;
      // Ad aynıysa soyada göre sırala
      return a.surname.localeCompare(b.surname, 'tr');
    });
  
  const pageCount = Math.ceil(filteredParents.length / parentsPerPage);
  const start = (page - 1) * parentsPerPage;
  const currentParents = filteredParents.slice(start, start + parentsPerPage);

  // Ekleme
  const handleAdd = () => {
    setShowAdd(true);
    setForm({ name: '', surname: '', email: '', contact: '', password: '' });
    setFormChanged(false);
  };
  const handleFormChange = e => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);
    if (showEdit && editParent) {
      setFormChanged(
        newForm.name !== editParent.name ||
        newForm.surname !== editParent.surname ||
        newForm.email !== editParent.email ||
        newForm.contact !== editParent.contact ||
        newForm.password !== editParent.password
      );
    } else {
      setFormChanged(
        newForm.name !== '' ||
        newForm.surname !== '' ||
        newForm.email !== '' ||
        newForm.contact !== '' ||
        newForm.password !== ''
      );
    }
  };
  // Ekleme/Düzenleme submit
  const handleFormSubmit = async e => {
    e.preventDefault();
    setShowAdd(false);
    setShowEdit(false);
    setLoading(true);
    try {
      if (showEdit) {
        // Şifre boşsa göndermeyelim
        const updateData = { ...form, id: editParent.id };
        if (!form.password) {
          delete updateData.password;
        }
        const result = await updateParent(updateData);
        if (result.success) {
          // Çocuk işlemleri
          for (const childId of pendingAddChildren) {
            await matchChildToParentAdmin(childId, editParent.id);
          }
          for (const childId of pendingRemoveChildren) {
            await unmatchChildFromParent(childId, editParent.id);
          }
          fetchParents();
        } else {
          setErrorMessage('Veli güncellenemedi.');
        }
      } else {
        // Yeni eklemede şifre zorunluysa, burada kontrol edebilirsiniz
        const result = await addParent(form);
        if (result.success) {
          fetchParents();
        } else {
          setErrorMessage('Veli eklenemedi.');
        }
      }
    } catch {
      setErrorMessage('İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  const handleFormClose = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowView(false);
    setForm({ name: '', surname: '', email: '', contact: '', password: '' });
    setEditParent(null);
    setViewParent(null);
    setFormChanged(false);
  };
  // Düzenle butonu
  const handleEdit = (id) => {
    const parent = parents.find(p => p.id === id);
    setEditParent(parent);
    setForm({
      name: parent.name,
      surname: parent.surname,
      email: parent.email,
      contact: parent.contact,
      password: parent.password
    });
    setShowEdit(true);
    setFormChanged(false);
  };
  // Görüntüle butonu
  const handleView = async (id) => {
    const parent = parents.find(p => p.id === id);
    setViewLoading(true);
    setShowView(true);
    setViewError('');
    try {
      const result = await getParentDetails(parent.id);
      if (result.success && result.data && result.data.parent) {
        setViewParent({
          ...result.data.parent,
          children: result.data.children
            ? result.data.children.map(c => ({
                name: c.name,
                surname: c.surname,
                birth_date: c.birth_date,
                athlete_number: c.athlete_number
              }))
            : [],
          children_count: result.data.children ? result.data.children.length : 0,
          status: (result.data.children && result.data.children.length > 0) ? 'Eşleşmiş' : 'Beklemede',
          source: 'parents',
        });
      } else {
        setViewError(result.error || 'Detaylar yüklenemedi.');
        setViewParent(parent);
      }
    } catch (err) {
      setViewError('Detaylar yüklenemedi.');
      setViewParent(parent);
    } finally {
      setViewLoading(false);
    }
  };
  // Onay modalı işlemleri - artık kullanılmıyor ama referans için bırakıldı
  const handleConfirmYes = () => {};
  const handleConfirmNo = () => {};
  // Sil butonu
  const handleDelete = (id) => {
    const parent = parents.find(p => p.id === id);
    setDeleteParent(parent);
    setShowDelete(true);
  };
  const handleDeleteConfirm = async () => {
    setShowDelete(false);
    setLoading(true);
    try {
      const result = await deleteParent(deleteParent.id);
      if (result.success) {
        fetchParents();
      } else {
        setErrorMessage('Veli silinemedi.');
      }
    } catch {
      setErrorMessage('Veli silinemedi.');
    } finally {
      setLoading(false);
      setDeleteParent(null);
    }
  };
  const handleDeleteCancel = () => {
    setShowDelete(false);
    setDeleteParent(null);
  };

  // Çocuk ekle
  const handleAddChild = async (childId) => {
    setChildLoading(true);
    setChildError('');
    try {
      const result = await matchChildToParentAdmin(childId, editParent.id);
      if (result.success) {
        // Güncel çocuk listesini çek
        const details = await getParentDetails(editParent.id);
        setParentChildren(details.data.children || []);
        fetchParents(); // Eşleştirme sonrası veliler listesini güncelle
      } else {
        setChildError('Çocuk eklenemedi.');
      }
    } catch {
      setChildError('Çocuk eklenemedi.');
    } finally {
      setChildLoading(false);
    }
  };
  // Çocuk çıkar
  const handleRemoveChild = async (childId) => {
    setChildLoading(true);
    setChildError('');
    try {
      const result = await unmatchChildFromParent(childId, editParent.id);
      if (result.success) {
        // Güncel çocuk listesini çek
        const details = await getParentDetails(editParent.id);
        setParentChildren(details.data.children || []);
        fetchParents(); // Eşleştirme sonrası veliler listesini güncelle
      } else {
        setChildError('Çocuk çıkarılamadı.');
      }
    } catch {
      setChildError('Çocuk çıkarılamadı.');
    } finally {
      setChildLoading(false);
    }
  };

  // Modal başlığı ve buton metni
  const modalTitle = showEdit ? 'Veli Düzenle' : 'Yeni Veli Ekle';

  // Yeni: Geçici ekleme/çıkarma state'leri
  const [pendingAddChildren, setPendingAddChildren] = useState([]); // eklenecek çocuk id'leri
  const [pendingRemoveChildren, setPendingRemoveChildren] = useState([]); // çıkarılacak çocuk id'leri

  // Edit modalı açıldığında pending state'leri sıfırla
  useEffect(() => {
    if (showEdit && editParent) {
      setPendingAddChildren([]);
      setPendingRemoveChildren([]);
    }
  }, [showEdit, editParent]);

  // Ekle butonuna tıkla: sadece local state'e ekle ve formChanged'i true yap
  const handleAddChildLocal = (childId) => {
    setPendingAddChildren(prev => [...prev, childId]);
    setPendingRemoveChildren(prev => prev.filter(id => id !== childId));
    setFormChanged(true);
  };
  // Çıkar butonuna tıkla: sadece local state'e ekle ve formChanged'i true yap
  const handleRemoveChildLocal = (childId) => {
    setPendingRemoveChildren(prev => [...prev, childId]);
    setPendingAddChildren(prev => prev.filter(id => id !== childId));
    setFormChanged(true);
  };
  // Kaydet butonuna basınca API'ye gönder
  const handleSaveChildren = async () => {
    setChildLoading(true);
    setChildError('');
    try {
      // Önce ekle
      for (const childId of pendingAddChildren) {
        await matchChildToParentAdmin(childId, editParent.id);
      }
      // Sonra çıkar
      for (const childId of pendingRemoveChildren) {
        await unmatchChildFromParent(childId);
      }
      // Güncel çocuk listesini çek
      const details = await getParentDetails(editParent.id);
      setParentChildren(details.data.children || []);
      setPendingAddChildren([]);
      setPendingRemoveChildren([]);
    } catch {
      setChildError('Çocuk işlemleri kaydedilemedi.');
    } finally {
      setChildLoading(false);
    }
  };

  return (
    <div className="players-card">
      <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />
      <div className="players-card-header table-header">
        <h2>Veliler</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Ara..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="header-buttons">
          <button className="refresh-btn" onClick={fetchParents} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
          <button className="add-btn" onClick={handleAdd}>Veli Ekle</button>
        </div>
      </div>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Veliler yükleniyor...</p>
        </div>
      )}
      {(showAdd || showEdit) && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <form className="add-player-form" onClick={e => e.stopPropagation()} onSubmit={handleFormSubmit}>
            <button type="button" className="close-x" onClick={handleFormClose}>&times;</button>
            <h3>{modalTitle}</h3>
            <input name="name" type="text" placeholder="Adı" value={form.name} onChange={handleFormChange} required />
            <input name="surname" type="text" placeholder="Soyadı" value={form.surname} onChange={handleFormChange} required />
            <input name="email" type="email" placeholder="E-posta" value={form.email} onChange={handleFormChange} required />
            <input name="contact" type="tel" placeholder="Telefon Numarası" value={form.contact} onChange={handleFormChange} required />
            <input name="password" type="password" placeholder="Şifre (opsiyonel)" value={form.password} onChange={handleFormChange} />
            <div className="form-actions">
              <button type="submit" className="add-btn" disabled={showEdit && !formChanged}>Kaydet</button>
            </div>
            {/* Çocuk ekle/çıkar bölümü sadece düzenlemede */}
            {showEdit && (
              <div className="children-section">
                <div className="child-section-title">Bu Veliye Bağlı Çocuklar</div>
                {childError && <div className="error-message">{childError}</div>}
                <div className="child-section-list">
                  {parentChildrenLoading ? (
                    <div>Yükleniyor...</div>
                  ) : parentChildren.length === 0 && pendingRemoveChildren.length === 0 ? (
                    <div className="child-none">Bu veliye bağlı çocuk yok.</div>
                  ) : (
                    parentChildren
                      .filter(child => !pendingRemoveChildren.includes(child.id))
                      .map(child => (
                        <div className="child-card" key={child.id}>
                          <div className="child-info">
                            <span className="child-name">{child.name} {child.surname}</span>
                            <span className="child-number">Sporcu No: {child.athlete_number}</span>
                          </div>
                          <button type="button" className="child-action-btn remove" onClick={() => handleRemoveChildLocal(child.id)} disabled={childLoading}>Çıkar</button>
                        </div>
                      ))
                  )}
                  {/* Yeni eklenecek çocuklar (henüz parentChildren'da yok) */}
                  {pendingAddChildren.map(childId => {
                    const child = allChildren.find(c => c.id === childId);
                    if (!child) return null;
                    return (
                      <div className="child-card" key={child.id}>
                        <div className="child-info">
                          <span className="child-name">{child.name} {child.surname}</span>
                          <span className="child-number">Sporcu No: {child.athlete_number}</span>
                        </div>
                        <button type="button" className="child-action-btn remove" onClick={() => setPendingAddChildren(pendingAddChildren.filter(id => id !== child.id))} disabled={childLoading}>Kaldır</button>
                      </div>
                    );
                  })}
                </div>
                <div className="child-section-title" style={{marginTop: '1.2rem'}}>Çocuk Ekle</div>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Çocuk ara..."
                  value={childSearch}
                  onChange={e => setChildSearch(e.target.value)}
                  style={{marginBottom: '0.7rem'}}
                />
                <div className="child-section-list">
                  {childLoading ? (
                    <div>Yükleniyor...</div>
                  ) : (
                    allChildren
                      .filter(child =>
                        (child.name + ' ' + child.surname).toLowerCase().includes(childSearch.toLowerCase()) &&
                        !parentChildren.some(pc => pc.id === child.id) &&
                        !pendingAddChildren.includes(child.id)
                      )
                      .map(child => (
                        <div className="child-card" key={child.id}>
                          <div className="child-info">
                            <span className="child-name">{child.name} {child.surname}</span>
                            <span className="child-number">Sporcu No: {child.athlete_number}</span>
                          </div>
                          <button type="button" className="child-action-btn add" onClick={() => handleAddChildLocal(child.id)} disabled={childLoading}>Ekle</button>
                        </div>
                      ))
                  )}
                </div>
                {/* Kaydet butonu kaldırıldı, sadece ana formun Kaydet'i kullanılacak */}
              </div>
            )}
          </form>
        </div>
      )}
      {showView && viewParent && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="view-player-modal fixed-modal" onClick={e => e.stopPropagation()}>
            <button type="button" className="close-x" onClick={handleFormClose}>&times;</button>
            <h3>Veli Bilgileri</h3>
            <div className="view-info-row"><span>Adı:</span> <b>{viewParent.name}</b></div>
            <div className="view-info-row"><span>Soyadı:</span> <b>{viewParent.last_name || viewParent.surname}</b></div>
            <div className="view-info-row"><span>E-posta:</span> <b>{viewParent.email || '-'}</b></div>
            <div className="view-info-row"><span>Telefon:</span> <b>{viewParent.phone || viewParent.contact || '-'}</b></div>
            <div className="view-info-row"><span>Durum:</span> <b className={viewParent.status === 'Eşleşmiş' ? 'status-matched' : 'status-pending'}>{viewParent.status}</b></div>
            <div className="view-info-row"><span>Çocuk Sayısı:</span> <b>{Array.isArray(viewParent.children) ? viewParent.children.length : (viewParent.matched_child_count || 0)}</b></div>
          </div>
        </div>
      )}

      {showDelete && deleteParent && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p>Veli silmek istiyor musunuz?</p>
            <div className="confirm-actions">
              <button className="yes-btn" onClick={handleDeleteConfirm}>Evet</button>
              <button className="no-btn delete" onClick={handleDeleteCancel}>Hayır</button>
            </div>
          </div>
        </div>
      )}
      {!loading && parents.length === 0 && (
        <div className="empty-state">
          <p>Henüz veli kaydı bulunmuyor</p>
          <button className="add-btn" onClick={handleAdd}>İlk Veliyi Ekle</button>
        </div>
      )}
      {!loading && parents.length > 0 && (
        <table className="parents-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Eşleşme Durumu</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {currentParents.map(parent => (
              <tr key={parent.id}>
                <td>
                  <div className="parent-name">{parent.name} {parent.surname}</div>
                </td>
                <td>
                  <span className={`parent-match-status ${parent.matched_child_count > 0 ? 'matched' : 'pending'}`}>{parent.matched_child_count > 0 ? 'Eşleşmiş' : 'Beklemede'}</span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(parent.id)}>Düzenle</button>
                  <button className="view-btn" onClick={() => handleView(parent.id)}>Görüntüle</button>
                  <button className="delete-btn" onClick={() => handleDelete(parent.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="players-pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Önceki</button>
        <span>{page} / {pageCount}</span>
        <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Sonraki</button>
      </div>
    </div>
  );
};

export default Parents; 