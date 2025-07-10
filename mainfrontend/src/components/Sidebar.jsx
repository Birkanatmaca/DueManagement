// src/components/Sidebar.jsx

import React from 'react';
import './Sidebar.scss';
import { Link, useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa'; // Sadece 'X' ikonu için FaTimes'ı import ediyoruz

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Ana Sayfa', path: '/admin' },
    { name: 'Oyuncular', path: '/admin/sports-players' },
    { name: 'Veliler', path: '/admin/parents' },
    { name: 'Aidatlar', path: '/admin/dues-operations' },
  ];

  const handleLinkClick = () => {
    // Mobil ekranda bir linke tıklanınca menüyü kapat
    if (window.innerWidth <= 700) {
      setOpen(false);
    }
  };

  return (
    <nav className={`sidebar ${open ? ' open' : ' closed'}`}>  
      <div className="sidebar-header">
        {/* Sadece masaüstünde görünecek ADMIN PANEL başlığı */}
        <span className="sidebar-title">ADMIN PANEL</span>
        <button className="sidebar-close-btn" onClick={() => setOpen(false)}>
          <FaTimes />
        </button>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li key={item.name} className={location.pathname === item.path ? 'active' : ''}>
            <Link to={item.path} onClick={handleLinkClick}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;