// src/components/Sidebar.jsx

import React from 'react';
import './Sidebar.scss';
import { Link, useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const role = localStorage.getItem('role');

  const adminMenuItems = [
    { name: 'Ana Sayfa', path: '/dashboard' },
    { name: 'Oyuncular', path: '/dashboard/sports-players' },
    { name: 'Veliler', path: '/dashboard/parents' },
    { name: 'Aidatlar', path: '/dashboard/dues-operations' },
  ];
  const userMenuItems = [
    { name: 'Anasayfa', path: '/dashboard' },
    { name: 'Sporcum', path: '/dashboard/my-child' },
    { name: 'Aidatlarım', path: '/dashboard/my-dues' },
    { name: 'Bilgilerim', path: '/dashboard/my-info' },
  ];
  const menuItems = role === 'admin' ? adminMenuItems : userMenuItems;

  const handleLinkClick = () => {
    if (window.innerWidth <= 700) {
      setOpen(false);
    }
  };

  return (
    <nav className={`sidebar${open ? ' open' : ' closed'}`}>  
      <div className="sidebar-header">
        <span className="sidebar-title">DASHBOARD</span>
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