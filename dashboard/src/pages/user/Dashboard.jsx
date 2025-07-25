import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';
import TableCard from '../../component/TableCard';
import Card from '../../component/Card';
import WelcomeCard from '../../component/WelcomeCard';
import { MdPerson, MdInfo } from 'react-icons/md';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Örnek aidat verileri (backend'den gelecek)
  const duesData = [
    { month: 'Ocak 2025', status: 'Ödendi' },
    { month: 'Şubat 2025', status: 'Ödenmedi' },
    { month: 'Mart 2025', status: 'Ödendi' },
    { month: 'Nisan 2025', status: 'Ödenmedi' },
    { month: 'Mayıs 2025', status: 'Ödendi' },
  ];

  React.useEffect(() => {
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
          username="Ahmet Yılmaz"
          onViewProfile={() => navigate('/user/information')}
        />

        <div style={{ marginTop: 24 }}>
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
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
