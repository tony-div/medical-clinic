import React from 'react';

// CORRECTED PATHS:
// Go up one level (..) then into the specific folder
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

import './Layout.css';

const Layout = ({ children, activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="app-wrapper">
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