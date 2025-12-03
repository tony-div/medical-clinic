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


  const easeInOutCubic = (t) => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const smoothScrollTo = (targetId, duration = 800) => { 
    const target = document.getElementById(targetId);
    if (!target) return;

    const navbarHeight = 80; 
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + (distance * ease));

      // Keep looping until time is up
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };



  const handleNavigation = (id) => {
    setActivePage(id); 
    smoothScrollTo(id, 1200); 
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