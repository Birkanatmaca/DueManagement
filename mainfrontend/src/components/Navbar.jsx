import React from 'react';
import './Navbar.scss';
import { FaBars } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onSidebarOpen }) => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    setShowLogout(false);
    navigate('/');
  };
  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button 
            className="navbar-toggle-btn"
            onClick={onSidebarOpen}
            aria-label="Sidebar Aç"
          >
            <FaBars />
          </button>
        </div>
        <div className="navbar-right">
          <span className="navbar-title-mobile">ADMIN PANEL</span>
          <button className="logout-btn" onClick={() => setShowLogout(true)}>Çıkış</button>
        </div>
      </div>
      {showLogout && (
        <div className="logout-modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <p>Çıkış yapmak istiyor musunuz?</p>
            <div className="logout-actions">
              <button className="yes-btn" onClick={handleLogout}>Evet</button>
              <button className="no-btn" onClick={() => setShowLogout(false)}>Hayır</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;