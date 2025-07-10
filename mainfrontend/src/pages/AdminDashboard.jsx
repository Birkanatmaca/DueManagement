// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './admindashboard.scss';
import { Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import SportsPlayers from './SportsPlayers';
import Parents from './Parents';
import Dues from './Dues';
import api from '../api';
import { listParents } from '../api/parents';

// Örnek veriler aynı kalabilir
const samplePlayers = Array.from({ length: 30 }, (_, i) => ({
  name: `Sporcu${i + 1}`,
  surname: `Soyad${i + 1}`,
  number: 1000 + i,
}));

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 700);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [playerPage, setPlayerPage] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  
  // API state'leri
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Toplam Sporcu', value: 0 },
    { label: 'Toplam Veli', value: 75 },
    { label: 'Yatırılan Aidat (₺)', value: '45.000' },
    { label: 'Ödenen Aidat Sayısı', value: 110 },
  ]);

  // Remove sampleParents and add real parent state
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsError, setParentsError] = useState('');


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 700;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Mobilde sidebar kapalı olsun
      } else {
        setSidebarOpen(true); // Masaüstüne geçince sidebar açık olsun
      }
    };
    
    // İlk yüklemede de kontrol et
    const initialMobile = window.innerWidth <= 700;
    setIsMobile(initialMobile);
    if (initialMobile) {
      setSidebarOpen(false); // Mobilde başlangıçta sidebar kapalı
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sporcuları getir
  const getPlayers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı');
        setLoading(false);
        return;
      }
      
      const response = await api.post('/admin', {
        data: {
          request: {
            token,
            category: "child",
            type: "listChildren"
          }
        }
      });
      
      console.log('Dashboard API Response:', response.data);
      
      if (response.data && response.data.data && response.data.data.status === 'OK') {
        const apiPlayers = response.data.data.response.children || [];
        const formattedPlayers = apiPlayers.map((player, index) => ({
          id: player.id || index + 1,
          name: player.name || `Sporcu ${index + 1}`,
          surname: player.surname || `Soyad ${index + 1}`,
          number: player.athlete_number || `ATA-${String(1000 + index).padStart(4, '0')}`
        }));
        
        setPlayers(formattedPlayers);
        
        // Stats'ı güncelle
        setStats(prevStats => 
          prevStats.map(stat => 
            stat.label === 'Toplam Sporcu' 
              ? { ...stat, value: formattedPlayers.length }
              : stat
          )
        );
      } else {
        console.error('API yanıtı başarısız:', response.data);
        setPlayers([]);
      }
    } catch (error) {
      console.error('getPlayers fonksiyonu hatası:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getParents = async () => {
    setParentsLoading(true);
    setParentsError('');
    try {
      const result = await listParents();
      if (result.success && result.data && Array.isArray(result.data.parents)) {
        setParents(result.data.parents);
        // Update stats for total parents
        setStats(prevStats =>
          prevStats.map(stat =>
            stat.label === 'Toplam Veli'
              ? { ...stat, value: result.data.parents.length }
              : stat
          )
        );
      } else {
        setParents([]);
        setParentsError('Veliler yüklenemedi.');
        setStats(prevStats =>
          prevStats.map(stat =>
            stat.label === 'Toplam Veli'
              ? { ...stat, value: 0 }
              : stat
          )
        );
      }
    } catch {
      setParents([]);
      setParentsError('Veliler yüklenemedi.');
      setStats(prevStats =>
        prevStats.map(stat =>
          stat.label === 'Toplam Veli'
            ? { ...stat, value: 0 }
            : stat
        )
      );
    } finally {
      setParentsLoading(false);
    }
  };

  useEffect(() => {
    getPlayers();
    getParents();
    // eslint-disable-next-line
  }, []);



  const playersPerPage = 10;
  const parentsPerPage = 10;
  const playerStart = (playerPage - 1) * playersPerPage;
  const parentStart = (parentPage - 1) * parentsPerPage;
  const playerPageCount = Math.ceil(players.length / playersPerPage);
  const parentPageCount = Math.ceil(parents.length / parentsPerPage);

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Navbar onSidebarOpen={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {isMobile && (
        <div 
          className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
          style={{ display: sidebarOpen ? undefined : 'none' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={
            <>
              <div className="dashboard-cards-row">
                {stats.map((stat, i) => (
                  <div className="dashboard-card" key={i}>
                    <div className="card-label">{stat.label}</div>
                    <div className="card-value">{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="dashboard-lists-row">
                <div className="dashboard-list-card">
                  <div className="card-header">
                    <h2>Sporcular</h2>
                    <button className="refresh-btn" onClick={getPlayers} disabled={loading}>
                      {loading ? 'Yükleniyor...' : 'Yenile'}
                    </button>
                  </div>
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Sporcular yükleniyor...</p>
                    </div>
                  ) : players.length === 0 ? (
                    <div className="empty-state">
                      <p>Henüz sporcu kaydı bulunmuyor</p>
                    </div>
                  ) : (
                    <>
                      <ul className="list-table">
                        <li className="list-header">
                          <span>Ad Soyad</span>
                          <span>Sporcu No</span>
                        </li>
                        {players.slice(playerStart, playerStart + playersPerPage).map((p, i) => (
                          <li key={p.id} className="list-row">
                            <span>{p.name} {p.surname}</span>
                            <span>{p.number}</span>
                          </li>
                        ))}
                      </ul>
                      {playerPageCount > 1 && (
                        <div className="list-pagination">
                          <button onClick={() => setPlayerPage(p => Math.max(1, p - 1))} disabled={playerPage === 1}>Önceki</button>
                          <span>{playerPage} / {playerPageCount}</span>
                          <button onClick={() => setPlayerPage(p => Math.min(playerPageCount, p + 1))} disabled={playerPage === playerPageCount}>Sonraki</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="dashboard-list-card">
                  <div className="card-header">
                    <h2>Veliler</h2>
                    <button className="refresh-btn" onClick={getParents} disabled={parentsLoading}>
                      {parentsLoading ? 'Yükleniyor...' : 'Yenile'}
                    </button>
                  </div>
                  {parentsLoading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Veliler yükleniyor...</p>
                    </div>
                  ) : parentsError ? (
                    <div className="empty-state">{parentsError}</div>
                  ) : parents.length === 0 ? (
                    <div className="empty-state">Henüz veli kaydı bulunmuyor</div>
                  ) : (
                    <>
                      <ul className="list-table">
                        <li className="list-header">
                          <span>Ad Soyad</span>
                          <span>Telefon</span>
                        </li>
                        {parents.slice(parentStart, parentStart + parentsPerPage).map((v) => (
                          <li key={v.id} className="list-row">
                            <span>{v.name} {v.last_name || v.surname}</span>
                            <span>{v.phone || v.contact || '-'}</span>
                          </li>
                        ))}
                      </ul>
                      {parentPageCount > 1 && (
                        <div className="list-pagination">
                          <button onClick={() => setParentPage(p => Math.max(1, p - 1))} disabled={parentPage === 1}>Önceki</button>
                          <span>{parentPage} / {parentPageCount}</span>
                          <button onClick={() => setParentPage(p => Math.min(parentPageCount, p + 1))} disabled={parentPage === parentPageCount}>Sonraki</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          } />
          <Route path="sports-players" element={<SportsPlayers />} />
          <Route path="parents" element={<Parents />} />
          <Route path="dues-operations" element={<Dues />} />
        </Routes>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;