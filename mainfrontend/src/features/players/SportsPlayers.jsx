import React, { useState, useEffect } from 'react';
import './sportsplayers.scss';
import ErrorToast from '../../components/ErrorToast';
import PlayerForm from '../../components/PlayerForm';
import PlayerList from '../../components/PlayerList';
import PlayerModal from '../../components/PlayerModal';
import ConfirmModal from '../../components/ConfirmModal';
import { listPlayers, addPlayer, updatePlayer, deletePlayer } from './players.js';

const playersPerPage = 20;
const emptyForm = { number: '', name: '', surname: '', birthdate: '', parent: '', contact: '' };

const SportsPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [formValues, setFormValues] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showView, setShowView] = useState(false);
  const [viewPlayer, setViewPlayer] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hata mesajı otomatik kaybolsun
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Sporcuları getir
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const result = await listPlayers();
      
      if (result.success && result.data) {
        const apiPlayers = result.data.children || [];
        // API'den gelen birth_date'i birthdate'e çevir
        const formatted = apiPlayers.map((p, i) => ({
          id: p.id || i + 1,
          number: p.athlete_number || '',
          name: p.name || '',
          surname: p.surname || '',
          birthdate: p.birth_date ? new Date(p.birth_date).toISOString().split('T')[0] : '',
          parent: p.parent_name || '',
          contact: p.contact || ''
        }));
        setPlayers(formatted);
      } else {
        setErrorMessage('Sporcular yüklenemedi.');
      }
    } catch (err) {
      console.error('fetchPlayers hatası:', err);
      setErrorMessage('Sporcular yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Filtrelenmiş, sıralanmış ve sayfalı oyuncular
  const filteredPlayers = players
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
  
  const pageCount = Math.ceil(filteredPlayers.length / playersPerPage);
  const start = (page - 1) * playersPerPage;
  const currentPlayers = filteredPlayers.slice(start, start + playersPerPage);

  // Form değişikliği
  const handleFormChange = e => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  // Ekle butonu
  const handleAdd = () => {
    setFormMode('add');
    setFormValues(emptyForm);
    setShowForm(true);
    setEditId(null);
  };

  // Düzenle butonu
  const handleEdit = id => {
    const player = players.find(p => p.id === id);
    setFormMode('edit');
    setFormValues({ ...player });
    setShowForm(true);
    setEditId(id);
  };

  // Görüntüle butonu
  const handleView = id => {
    const player = players.find(p => p.id === id);
    setViewPlayer(player);
    setShowView(true);
  };

  // Sil butonu
  const handleDelete = id => {
    const player = players.find(p => p.id === id);
    setConfirmText(`"${player.name} ${player.surname}" sporcusunu silmek istiyor musunuz?`);
    setShowConfirm(true);
    setConfirmAction(() => async () => {
      setShowConfirm(false);
      setLoading(true);
      try {
        const result = await deletePlayer(id);
        if (result.success) {
          fetchPlayers();
        } else {
          setErrorMessage('Sporcu silinemedi.');
        }
      } catch {
        setErrorMessage('Sporcu silinemedi.');
      } finally {
        setLoading(false);
      }
    });
  };

  // Form gönderimi
  const handleFormSubmit = async e => {
    e.preventDefault();
    setShowForm(false);
    setLoading(true);
    try {
      if (formMode === 'add') {
        const result = await addPlayer(formValues);
        if (result.success) {
          fetchPlayers();
        } else {
          setErrorMessage('Sporcu eklenemedi.');
        }
      } else if (formMode === 'edit') {
        const result = await updatePlayer({ ...formValues, id: editId });
        if (result.success) {
          fetchPlayers();
        } else {
          setErrorMessage('Sporcu güncellenemedi.');
        }
      }
    } catch {
      setErrorMessage('İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Modal kapatma
  const handleFormClose = () => {
    setShowForm(false);
    setFormValues(emptyForm);
    setEditId(null);
  };
  const handleViewClose = () => {
    setShowView(false);
    setViewPlayer(null);
  };
  const handleConfirmNo = () => {
    setShowConfirm(false);
    setConfirmAction(() => () => {});
  };

  return (
    <div className="players-card">
      <ErrorToast message={errorMessage} onClose={() => setErrorMessage('')} />
      <div className="players-card-header table-header">
        <h2>Sporcular</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Ara..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="header-buttons">
          <button className="refresh-btn" onClick={fetchPlayers} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Yenile'}
          </button>
          <button className="add-btn" onClick={handleAdd}>Sporcu Ekle</button>
        </div>
      </div>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Sporcular yükleniyor...</p>
        </div>
      )}
      {showForm && (
        <PlayerForm
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          mode={formMode}
        />
      )}
      {showView && (
        <PlayerModal player={viewPlayer} onClose={handleViewClose} />
      )}
      {showConfirm && (
        <ConfirmModal text={confirmText} onYes={confirmAction} onNo={handleConfirmNo} />
      )}
      {!loading && players.length === 0 && (
        <div className="empty-state">
          <p>Henüz sporcu kaydı bulunmuyor</p>
          <button className="add-btn" onClick={handleAdd}>İlk Sporcuyu Ekle</button>
        </div>
      )}
      {!loading && players.length > 0 && (
        <PlayerList
          players={currentPlayers}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          page={page}
          setPage={setPage}
          pageCount={pageCount}
        />
      )}
    </div>
  );
};

export default SportsPlayers; 