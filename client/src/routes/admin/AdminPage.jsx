import React, { useState, useCallback } from 'react';
import Layout from './Layout/Layout';
import Dashboard from './Pages/Dashboard';
import Users from './Pages/Users/Users';
import Appointments from './Pages/Appointments/Appointments';

const AdminPage = () => {
  // We still keep this state to know which Sidebar button should look "active"
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // [ADDED] - Refresh key to trigger Dashboard refresh when data changes
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // [ADDED] - Callback function to refresh Dashboard when data changes
  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      {/* 1. Dashboard Section */}
      {/* [FIX] - Removed height: 100vh to allow natural content sizing */}
      <section id="dashboard" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <Dashboard refreshKey={refreshKey} />
      </section>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* 2. Users Section */}
      <section id="users" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <Users onDataChange={handleDataChange} />
      </section>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* 3. Appointments Section */}
      <section id="appointments" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <Appointments onDataChange={handleDataChange} />
      </section>
    </Layout>
  );
};

export default AdminPage;