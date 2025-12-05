import React from 'react';

import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

import './Layout.css';

const Layout = ({ children, activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="app-wrapper">
      {/* Mobile overlay - closes sidebar when clicked */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={toggleSidebar}
      />

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
      />

      <div className={`main-container ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Navbar
          activePage={activePage}
          toggleSidebar={toggleSidebar}
        />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;