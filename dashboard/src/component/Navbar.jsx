import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import '../assets/navbar.scss';
import { MdPerson } from 'react-icons/md';

const Navbar = ({ title = 'Dashboard', onMenuClick, onMenuClose, mobileOpen }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <button
            className="navbar-menu-btn"
            aria-label={mobileOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
            onClick={mobileOpen ? onMenuClose : onMenuClick}
          >
            {mobileOpen ? (
              <span style={{ fontSize: 20 }}>✕</span>
            ) : (
              <span>☰</span>
            )}
          </button>
          <span className="navbar-title">{title}</span>
        </div>
        <div className="navbar-user-area">
          <span className="navbar-username">Admin</span>
          <MdPerson className="navbar-usericon" size={26} />
        </div>
      </header>
    </>
  );
};

export default Navbar; 