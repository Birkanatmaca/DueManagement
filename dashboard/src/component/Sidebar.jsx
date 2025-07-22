import React from 'react';
import '../assets/sidebar.scss';
import { MdHome, MdPeople, MdGroup, MdPayment } from 'react-icons/md';
import { MdLogout } from 'react-icons/md';
import ConfirmModal from './ConfirmModal';

const links = [
  { name: 'Anasayfa', icon: <MdHome />, path: '/admin/Dashboard' },
  { name: 'Sporcu Listesi', icon: <MdPeople />, path: '/admin/athletes' },
  { name: 'Veli Listesi', icon: <MdGroup />, path: '/admin/parents' },
  { name: 'Aidat Listesi', icon: <MdPayment />, path: '/admin/dues' },
];

const Sidebar = ({ expanded = true, setExpanded, mobileOpen, onToggle }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 900);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const sidebarClass = [
    'sidebar',
    !expanded ? 'collapsed' : '',
    isMobile && mobileOpen ? 'mobile-open' : '',
  ].join(' ').trim();

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}
      <aside className={sidebarClass}>
        <div className="sidebar__header">
          <span className="sidebar__logo">LOGO</span>
          {expanded && <span className="sidebar__admin">Admin</span>}
        </div>
        <nav className="sidebar__nav">
          {links.map(link => (
            <a
              key={link.name}
              href={link.path}
              className="sidebar__link"
              style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
              onClick={isMobile ? onToggle : undefined}
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