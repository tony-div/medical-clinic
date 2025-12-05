import React from 'react';
import { MdDashboard, MdPeople, MdEvent } from 'react-icons/md';
import './Sidebar.css';
import logo from './logo.png';

const Sidebar = ({ activePage, setActivePage, isOpen }) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { id: 'users', label: 'User Management', icon: <MdPeople /> },
    { id: 'appointments', label: 'Appointments', icon: <MdEvent /> },
  ];

  const handleNavigation = (id) => {
    setActivePage(id);
    
    // Standard, efficient smooth scrolling
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="logo-container">
        <img src={logo} alt="App Logo" className="sidebar-logo" />
      </div>
      
      <ul className="menu">
        {menuItems.map((item) => (
          <li 
            key={item.id}
            className={`menu-item ${activePage === item.id ? 'active' : ''}`} 
            onClick={() => handleNavigation(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {isOpen && <span className="label">{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;