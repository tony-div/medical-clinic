import React from 'react';
import { MdPeople, MdMedicalServices, MdEventAvailable } from 'react-icons/md';

const Dashboard = () => {
  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Dashboard</h2>
      <div style={styles.cardContainer}>
        <Card 
          title="Total Users" 
          count="1,250" 
          icon={<MdPeople />} 
          // Passing a specific blue outline color
          borderColor="#1e4b8f"
        />
        <Card 
          title="Total Doctors" 
          count="45" 
          icon={<MdMedicalServices />} 
          borderColor="#1e4b8f"
        />
        <Card 
          title="Today's Appointments" 
          count="32" 
          icon={<MdEventAvailable />} 
          borderColor="#1e4b8f"
        />
      </div>
    </div>
  );
};

const Card = ({ title, count, icon, borderColor }) => (
  <div style={{ ...styles.card, border: `1px solid ${borderColor}` }}>
    <div>
      <p style={styles.cardTitle}>{title}</p>
      <h3 style={styles.cardCount}>{count}</h3>
    </div>
    <div style={styles.iconBox}>
      {/* Icon color matches the border */}
      {React.cloneElement(icon, { style: { color: '#fff', fontSize: '24px' } })}
    </div>
  </div>
);

const styles = {
  cardContainer: {
    display: 'flex',
    gap: '24px', // Increased gap to match image
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: '250px',
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    // The shadow is softer in your reference
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.2s',
  },
  cardTitle: { color: '#666', margin: 0, fontSize: '15px', fontWeight: '500' },
  cardCount: { margin: '8px 0 0 0', fontSize: '32px', color: '#333' },
  iconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#1e4b8f', // Blue background for icon
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export default Dashboard;