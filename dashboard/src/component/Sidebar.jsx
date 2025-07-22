import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/sidebar.scss';
import { MdHome, MdPeople, MdGroup, MdPayment, MdPerson, MdLogout } from 'react-icons/md';
import ConfirmModal from './ConfirmModal';

const getSidebarLinks = (role) => {
  if (role === 'admin') {
    return [
      { name: 'Anasayfa', icon: <MdHome />, path: '/admin/Dashboard' },
      { name: 'Sporcu Listesi', icon: <MdPeople />, path: '/admin/athletes' },
      { name: 'Veli Listesi', icon: <MdGroup />, path: '/admin/parents' },
      { name: 'Aidat Listesi', icon: <MdPayment />, path: '/admin/dues' },
    ];
  }
  return [
    { name: 'Anasayfa', icon: <MdHome />, path: '/user/dashboard' },
    { name: 'Bilgilerim', icon: <MdPerson />, path: '/user/information' },
    { name: 'Aidatlarım', icon: <MdPayment />, path: '/user/dues' },
  ];
};

const Sidebar = ({ expanded = true, setExpanded, mobileOpen, onToggle, role: propRole }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentRole, setCurrentRole] = useState(propRole || localStorage.getItem('role') || 'user');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);

    // Update role when prop changes
    if (propRole) {
      setCurrentRole(propRole);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [propRole]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleLinkClick = (path, e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return;
    }
    
    if (isMobile) onToggle();
    navigate(path);
  };

  const sidebarClass = [
    'sidebar',
    !expanded ? 'collapsed' : '',
    isMobile && mobileOpen ? 'mobile-open' : '',
  ].join(' ').trim();

  const links = getSidebarLinks(currentRole);

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}

      <aside className={sidebarClass}>
        <div className="sidebar__header">
          <span className="sidebar__logo">LOGO</span>
          {expanded && (
            <span className="sidebar__admin">
              {currentRole === 'admin' ? 'Admin Panel' : 'Kullanıcı Panel'}
            </span>
          )}
        </div>
        <nav className="sidebar__nav">
          {links.map(link => (
            <a
              key={link.name}
              href={link.path}
              className="sidebar__link"
              style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
              onClick={(e) => handleLinkClick(link.path, e)}
            >
              <span className="sidebar__icon">{link.icon}</span>
              {expanded && <span>{link.name}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar__logout-footer">
          <a
            className="sidebar__link sidebar__logout-link"
            style={{ justifyContent: expanded ? 'flex-start' : 'center', color: '#e53935' }}
            onClick={e => { e.preventDefault(); setShowLogoutModal(true); }}
            href="#logout"
          >
            <span className="sidebar__icon"><MdLogout /></span>
            {expanded && <span>Çıkış Yap</span>}
          </a>
        </div>
        <div className="sidebar__footer">
          <span className="sidebar__copyright">© 2025 BIACA SOFTWARE & MEDIA</span>

          <ConfirmModal
            open={showLogoutModal}
            title="Çıkış yapmak istediğinize emin misiniz?"
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;