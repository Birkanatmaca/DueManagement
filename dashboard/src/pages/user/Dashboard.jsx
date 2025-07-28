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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [parentName, setParentName] = useState(localStorage.getItem('name') || '');
  const [duesData, setDuesData] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const handleResize = () => setIsMobile(window.innerWidth < 900);
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
          marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72),
          marginTop: 64,
          padding: 24,
          transition: 'margin-left 0.2s',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <WelcomeCard
          username={parentName}
          onViewProfile={() => navigate('/user/information')}
        />

        <div style={{ marginTop: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div>Yükleniyor...</div>
            </div>
          ) : (
            <TableCard
              title="Aidat Bilgilerim"
              iconType="parent"
              columns={[
                {
                  label: 'Ay',
                  key: 'month',
                  style: { textAlign: 'left' }
                },
                {
                  label: 'Durum',
                  key: 'status',
                  style: { textAlign: 'right' },
                  render: (status) => (
                    <span style={{
                      color: status === 'Ödendi' ? '#4caf50' : '#f44336',
                      fontWeight: 500
                    }}>
                      {status}
                    </span>
                  )
                }
              ]}
              data={duesData}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
