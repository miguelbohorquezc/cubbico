//@ts-ignore
import React, { useState } from 'react';
import './Navbar.css';
import { useSelector } from 'react-redux';
import { useUserForm } from '../userForm/useUserForm';
import { NotificationBell } from '../notificationBell/NotificationBell';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

    const {handleLogout,} = useUserForm();

  //@ts-ignore
  const userEmail = useSelector((state) => state.user.email);
   //@ts-ignore
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '';


  return (
    <nav className="navbar">
      <div className="navbar-content flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="breadcrumb">

          <span className="breadcrumb-item">Colina Campestre School</span>
          <span className="breadcrumb-separator"></span>
          <span className="breadcrumb-item active">{}</span>
        </div>

        {/* Sección derecha: Notificaciones + Usuario */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <NotificationBell />

          {/* Menú de usuario */}
          <div className="user-menu-container">
          <button className="user-menu-toggle" onClick={toggleDropdown}>
            <span className="user-avatar-color">{}</span>
            <span className="user-name">{userEmail}</span>
            <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-avatar"></span>
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">Usuario</span>
                  <span className="dropdown-user-email">{userEmail}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <span className="logout-icon"></span>
                Cerrar sesión
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;