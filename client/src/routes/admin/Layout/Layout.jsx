import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import './Layout.css';

const Layout = ({ children, activePage, setActivePage, isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="app-wrapper">
      {/* 1. Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={isSidebarOpen} 
      />
      
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
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