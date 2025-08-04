import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import TableCard from '../../component/TableCard';
import Card from '../../component/Card';
import WelcomeCard from '../../component/WelcomeCard';
import { MdPerson, MdInfo } from 'react-icons/md';
import { getParentInformation, getUserDues } from '../../services/userServices';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [parentName, setParentName] = useState(localStorage.getItem('name') || '');
  const [duesData, setDuesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Fetch parent info on mount
  useEffect(() => {
    const fetchParent = async () => {
      const res = await getParentInformation();
      if (res.data && res.data.response && res.data.response.parent && res.data.response.parent.name) {
        setParentName(res.data.response.parent.name);
        localStorage.setItem('name', res.data.response.parent.name);
      }
    };
    fetchParent();
  }, []);

  // API'den aidat verilerini çek
  useEffect(() => {
    const fetchDues = async () => {
      setLoading(true);
      try {
        const res = await getUserDues();
        if (res.data && res.data.response && Array.isArray(res.data.response.dues)) {
          // Sadece 2025 yılı için verileri formatla ve ay sırasına göre sırala
          const formattedData = res.data.response.dues
            .filter(item => item.year === 2025 && item.month >= 1 && item.month <= 12)
            .sort((a, b) => a.month - b.month) // Ay sırasına göre sırala
            .map(item => {
              // Ay numarasını ay adına çevir
              const monthNames = [
                'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
              ];
              const monthName = monthNames[item.month - 1] || '';
              
              return {
                month: `${monthName} 2025`,
                status: item.is_paid ? 'Ödendi' : 'Ödenmedi'
              };
            });
          setDuesData(formattedData);
        } else {
          setDuesData([]);
        }
      } catch (error) {
        console.error('Aidat verileri çekilemedi:', error);
        setDuesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDues();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Sidebar
        expanded={isMobile ? mobileOpen : sidebarExpanded}
        setExpanded={setSidebarExpanded}
        mobileOpen={mobileOpen}
        onToggle={isMobile ? () => setMobileOpen(false) : undefined}
        role="user"
      />
      <Navbar
        title="User Panel"
        onMenuClick={() => setMobileOpen(true)}
        onMenuClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
        username={parentName}
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
        <WelcomeCard
          username={parentName}
          onViewProfile={() => navigate('/user/information')}
        />

        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px',
              color: '#94a3b8',
              fontSize: '16px'
            }}>
              <div>Yükleniyor...</div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: isMobile ? '0' : '0 20%'
            }}>
              <div style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : '600px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    padding: '20px 24px',
                    borderBottom: '1px solid #475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                      👥
                    </div>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#ffffff'
                      }}>
                        Aidat Bilgilerim
                      </h3>
                      <span style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {duesData.length} kayıt
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px 24px' }}>
                    {duesData.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#94a3b8',
                        background: '#1e293b',
                        borderRadius: '8px',
                        border: '1px solid #475569',
                        margin: '16px'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          Aidat Kaydı Bulunamadı
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#64748b'
                        }}>
                          Henüz hiç aidat kaydı bulunmuyor.
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Table Header */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '16px',
                          padding: '12px 16px',
                          background: '#334155',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#e2e8f0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Ay
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#e2e8f0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            textAlign: 'center'
                          }}>
                            Durum
                          </div>
                        </div>

                        {/* Table Rows */}
                        {duesData
                          .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                          .map((item, index) => (
                          <div key={index} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '16px',
                            padding: '12px 16px',
                            background: '#1e293b',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            border: '1px solid #475569',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{
                              fontSize: isMobile ? '14px' : '16px',
                              fontWeight: '500',
                              color: '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {item.month}
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                color: item.status === 'Ödendi' ? '#10b981' : '#ef4444',
                                fontWeight: 500,
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                background: item.status === 'Ödendi' 
                                  ? 'rgba(16, 185, 129, 0.1)' 
                                  : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${item.status === 'Ödendi' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                              }}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Pagination */}
                        {duesData.length > itemsPerPage && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 0',
                            marginTop: '16px',
                            borderTop: '1px solid #475569'
                          }}>
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                              disabled={currentPage === 0}
                              style={{
                                padding: '8px 16px',
                                background: currentPage === 0 ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: currentPage === 0 ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              ← Önceki
                            </button>
                            
                            <div style={{
                              fontSize: '14px',
                              color: '#94a3b8',
                              fontWeight: '500'
                            }}>
                              Sayfa {currentPage + 1} / {Math.ceil(duesData.length / itemsPerPage)}
                            </div>
                            
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(duesData.length / itemsPerPage) - 1, prev + 1))}
                              disabled={currentPage === Math.ceil(duesData.length / itemsPerPage) - 1}
                              style={{
                                padding: '8px 16px',
                                background: currentPage === Math.ceil(duesData.length / itemsPerPage) - 1 ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: currentPage === Math.ceil(duesData.length / itemsPerPage) - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: currentPage === Math.ceil(duesData.length / itemsPerPage) - 1 ? 0.5 : 1,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Sonraki →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
