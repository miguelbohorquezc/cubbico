import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    console.log('Sesión cerrada');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-item">Inicio</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">Panel</span>
        </div>

        {/* Menú de usuario */}
        <div className="user-menu-container">
          <button className="user-menu-toggle" onClick={toggleDropdown}>
            <span className="user-avatar">JS</span>
            <span className="user-name">John Smith</span>
            <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-avatar">JS</span>
                <div className="dropdown-user-info">
                  <span className="dropdown-user-name">John Smith</span>
                  <span className="dropdown-user-email">john@example.com</span>
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
    </nav>
  );
};

export default Navbar;