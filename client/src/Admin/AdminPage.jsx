import React, { useState } from 'react';
import Layout from './Layout/Layout';
import Dashboard from './Pages/Dashboard';
import Users from './Pages/Users/Users';

const AdminPage = () => {
  // We still keep this state to know which Sidebar button should look "active"
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      {/* 1. Dashboard Section */}
      <section id="dashboard" style={{ paddingTop: '20px', minHeight: '80vh' }}>
        <Dashboard />
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* 2. Users Section */}
      <section id="users" style={{ paddingTop: '20px', minHeight: '80vh' }}>
        <Users />
      </section>

      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* 3. Appointments Section (Placeholder) */}
      <section id="appointments" style={{ paddingTop: '20px', minHeight: '80vh' }}>
        <h2>Appointments Section</h2>
        <p>This section is scrolled to via anchor link.</p>
      </section>
    </Layout>
  );
};

export default AdminPage;