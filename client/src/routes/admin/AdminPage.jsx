import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './Pages/Dashboard';
import Users from './Pages/Users/Users';
import Appointments from './Pages/Appointments/Appointments';

export default function AdminApp() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. SMART STATE INITIALIZATION
  // Priority: 
  // A. Incoming Navigation Note (e.g. Back button)
  // B. Local Storage (Page Refresh)
  // C. Default ('dashboard')
  const [activePage, setActivePage] = useState(() => {
      if (location.state?.activePage) return location.state.activePage;
      return localStorage.getItem('admin_active_tab') || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 2. PERSISTENCE: Save tab whenever it changes
  useEffect(() => {
    localStorage.setItem('admin_active_tab', activePage);
  }, [activePage]);

  // 3. CLEANUP: Clear navigation state so it doesn't interfere later
  useEffect(() => {
    if (location.state?.activePage) {
        window.history.replaceState({}, document.title);
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      isSidebarOpen={isSidebarOpen} 
      toggleSidebar={toggleSidebar}
    >
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'users' && <Users />}
      {activePage === 'appointments' && <Appointments />}
    </Layout>
  );
}