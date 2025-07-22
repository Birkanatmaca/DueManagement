import React, { useState } from 'react';
import Sidebar from '../../component/Sidebar';
import Navbar from '../../component/Navbar';

const UserDashboard = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <Sidebar
        expanded={isMobile ? mobileOpen : sidebarExpanded}
        setExpanded={setSidebarExpanded}
        mobileOpen={mobileOpen}
        onToggle={isMobile ? () => setMobileOpen(false) : undefined}
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
        }}
      >
        {/* User dashboard içeriği */}
        User dashboard içeriği
      </div>
    </>
  );
};

export default UserDashboard;
