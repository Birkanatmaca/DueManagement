import React, { useState, useEffect } from 'react';
import '../assets/parentmodal.scss';

const ParentEditModal = ({ open, onClose, parent, onSave, listChildren, getParentDetails, matchChildToParentAdmin, unmatchChildFromParentAdmin, isAddMode = false }) => {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    child: '',
    password: ''
  });
  const [allChildren, setAllChildren] = useState([]);
  const [matchedChildren, setMatchedChildren] = useState([]);
  const [childSearch, setChildSearch] = useState('');
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [initialMatchedChildren, setInitialMatchedChildren] = useState([]);

  useEffect(() => {
    if (open && parent && parent.id && listChildren && getParentDetails) {
      setLoadingChildren(true);
      const token = localStorage.getItem('token') || 'demo-token';
      Promise.all([
        listChildren(token),
        getParentDetails(token, parent.id)
      ]).then(([childrenRes, parentDetailsRes]) => {
        let children = [];
        if (childrenRes && childrenRes.data && Array.isArray(childrenRes.data.response?.children)) {
          children = childrenRes.data.response.children;
        }
        
        let matched = [];
        if (parentDetailsRes && parentDetailsRes.data && Array.isArray(parentDetailsRes.data.response?.children)) {
          matched = parentDetailsRes.data.response.children;
        }
        
        // Eşleşmiş çocukları tüm çocuklar listesinden çıkar
        const matchedIds = matched.map(child => child.id);
        const availableChildren = children.filter(child => !matchedIds.includes(child.id));
        
        setAllChildren(availableChildren);
        setMatchedChildren(matched);
        setInitialMatchedChildren(matched);
        
        if (parentDetailsRes && parentDetailsRes.data && parentDetailsRes.data.response?.parent) {
          const p = parentDetailsRes.data.response.parent;
          setForm(f => ({
            ...f,
            name: p.name || '',
            surname: p.last_name || '',
            phone: p.phone || '',
            email: p.email || '',
            password: ''
          }));
        }
        setLoadingChildren(false);
      });
    }
  }, [open, parent, listChildren, getParentDetails]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Çocuk ekleme işlemi (sadece UI'da)
  const handleAddChild = (child) => {
    setMatchedChildren(prev => [...prev, child]);
    setAllChildren(prev => prev.filter(c => c.id !== child.id));
  };

  // Çocuk çıkarma işlemi (sadece UI'da)
  const handleRemoveChild = (child) => {
    setMatchedChildren(prev => prev.filter(c => c.id !== child.id));
    setAllChildren(prev => [...prev, child]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || 'demo-token';

    // Eklenecek ve çıkarılacak çocukları belirle
    const toAdd = matchedChildren.filter(c => !initialMatchedChildren.some(ic => ic.id === c.id));
    const toRemove = initialMatchedChildren.filter(ic => !matchedChildren.some(c => c.id === ic.id));

    try {
      // Önce form bilgilerini güncelle
      await onSave(form);

      // Sonra çocuk eşleştirmelerini yap
      const promises = [
        ...toAdd.map(child => matchChildToParentAdmin(token, child.id, parent.id)),
        ...toRemove.map(child => unmatchChildFromParentAdmin(token, child.id, parent.id))
      ];

      await Promise.all(promises);
      
      // Çocuk eşleştirme işlemlerinden sonra parent listesini yenile
      if (typeof onSave === 'function') {
        // onSave fonksiyonuna özel bir parametre göndererek yenileme işlemini tetikleyebiliriz
        // veya ayrı bir callback fonksiyonu kullanabiliriz
        onSave(form, true); // true parametresi yenileme işlemini tetikler
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating parent:', error);
      // Hata durumunda kullanıcıya bilgi verilebilir
    }
  };

  // Arama filtresi - sadece eşleşmemiş çocukları göster
  const filteredChildren = allChildren.filter(child => {
    const search = childSearch.toLowerCase();
    return (
      (child.name + ' ' + (child.surname || '')).toLowerCase().includes(search) ||
      (child.athlete_number || '').toLowerCase().includes(search)
    );
  });

  if (!open) return null;
  return (
    <div className="parent-modal__overlay">
      <div className="parent-modal">
        <button className="parent-modal__close" onClick={onClose}>&times;</button>
        <h2>{isAddMode ? 'Veli Ekle' : 'Veli Düzenle'}</h2>
        <form className="parent-modal__content" onSubmit={handleSubmit}>
          <div className="parent-modal__field">
            <label>Veli Adı:</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </div>
          <div className="parent-modal__field">
            <label>Veli Soyadı:</label>
            <input name="surname" type="text" value={form.surname} onChange={handleChange} required />
          </div>
          <div className="parent-modal__field">
            <label>Telefon:</label>
            <input name="phone" type="text" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="parent-modal__field">
            <label>E-posta:</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="parent-modal__field">
            <label>Şifre:</label>
            <input 
              name="password" 
              type="password" 
              value={form.password || ''} 
              onChange={handleChange} 
              placeholder={isAddMode ? "Şifre girin" : "Yeni şifre girmek için doldurun, boş bırakırsanız şifre değişmez"}
              required={isAddMode}
            />
          </div>
          {/* Eşleşmiş çocuklar */}
          <div style={{ margin: '18px 0 8px 0' }}>
            <strong>Eşleşmiş Çocuklar:</strong>
            {loadingChildren ? <div>Yükleniyor...</div> : (
              matchedChildren.length === 0 ? <div style={{ color: '#e53935' }}>Hiçbir çocuk eşleşmemiş.</div> :
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {matchedChildren.map(child => (
                  <li key={child.id} className="parent-modal__child-card" style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <span className="info" style={{ flex: 1 }}>{child.name} {child.surname} ({child.athlete_number})</span>
                    <button 
                      type="button" 
                      style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '2px 10px', marginLeft: 8, cursor: 'pointer' }} 
                      onClick={() => handleRemoveChild(child)}
                    >
                      Çıkar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Çocuk ekle arama */}
          <div style={{ margin: '18px 0 8px 0' }}>
            <strong>Çocuk Ara ve Ekle:</strong>
            <input
              type="text"
              placeholder="Sporcu adı veya numarası ile ara..."
              value={childSearch}
              onChange={e => setChildSearch(e.target.value)}
              style={{ width: '100%', margin: '8px 0', padding: '6px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 15 }}
            />
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', maxHeight: 120, overflowY: 'auto' }}>
              {filteredChildren.map(child => (
                <li key={child.id} className="parent-modal__child-card" style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span className="info" style={{ flex: 1 }}>{child.name} {child.surname} ({child.athlete_number})</span>
                  <button 
                    type="button" 
                    style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '2px 10px', marginLeft: 8, cursor: 'pointer' }} 
                    onClick={() => handleAddChild(child)}
                  >
                    Ekle
                  </button>
                </li>
              ))}
              {filteredChildren.length === 0 && <li style={{ color: '#888' }}>Sonuç yok</li>}
            </ul>
          </div>
          <button type="submit" className="parent-modal__save">Kaydet</button>
        </form>
      </div>
    </div>
  );
};

export default ParentEditModal; 