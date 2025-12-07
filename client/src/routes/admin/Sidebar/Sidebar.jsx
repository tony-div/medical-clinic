import React, { useEffect } from 'react';
import { MdDashboard, MdPeople, MdEvent } from 'react-icons/md';
import './Sidebar.css';
import logo from './logo.png';

const Sidebar = ({ activePage, setActivePage, isOpen }) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { id: 'users', label: 'User Management', icon: <MdPeople /> },
    { id: 'appointments', label: 'Appointments', icon: <MdEvent /> },
  ];

  // [ADDED] - Scroll offset to keep title visible below any fixed header
  const SCROLL_OFFSET = 80;

  const handleNavigation = (id) => {
    setActivePage(id);

    // [MODIFIED] - Scroll with offset so title is visible
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - SCROLL_OFFSET,
        behavior: 'smooth'
      });
    }
  };

  // [ADDED] - Dynamic active state on scroll using IntersectionObserver
  useEffect(() => {
    const sectionIds = menuItems.map(item => item.id);

    const observerOptions = {
      root: null, // viewport
      rootMargin: '-20% 0px -60% 0px', // trigger when section is in upper part of viewport
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActivePage(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      sectionIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [setActivePage]);

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