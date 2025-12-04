import React, { useEffect, useState } from 'react';
import { MdPeople, MdMedicalServices, MdEventAvailable } from 'react-icons/md';
import { DB_PATIENTS_KEY, DB_DOCTORS_KEY, DB_APPOINTMENTS_KEY } from '../../../data/initDB'; // Adjust path

const Dashboard = () => {
  // Use State for Real Data
  const [stats, setStats] = useState({ patients: 0, doctors: 0, todayAppts: 0 });

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
    const doctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
    const appts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");

    const today = new Date().toISOString().split('T')[0];
    const todaysCount = appts.filter(a => a.date === today).length;

    setStats({
        patients: patients.length,
        doctors: doctors.length,
        todayAppts: todaysCount
    });
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Dashboard</h2>
      <div style={styles.cardContainer}>
        <Card 
          title="Total Users" 
          count={stats.patients} // Real
          icon={<MdPeople />} 
          borderColor="#1e4b8f"
        />
        <Card 
          title="Total Doctors" 
          count={stats.doctors} // Real
          icon={<MdMedicalServices />} 
          borderColor="#1e4b8f"
        />
        <Card 
          title="Today's Appointments" 
          count={stats.todayAppts} // Real
          icon={<MdEventAvailable />} 
          borderColor="#1e4b8f"
        />
      </div>
    </div>
  );
};

// ... (Rest of Card component and styles remain exactly as your teammate wrote)
const Card = ({ title, count, icon, borderColor }) => (
  <div style={{ ...styles.card, border: `1px solid ${borderColor}` }}>
    <div>
      <p style={styles.cardTitle}>{title}</p>
      <h3 style={styles.cardCount}>{count}</h3>
    </div>
    <div style={styles.iconBox}>
      {React.cloneElement(icon, { style: { color: '#fff', fontSize: '24px' } })}
    </div>
  </div>
);

const styles = {
  cardContainer: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  card: { flex: 1, minWidth: '250px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' },
  cardTitle: { color: '#666', margin: 0, fontSize: '15px', fontWeight: '500' },
  cardCount: { margin: '8px 0 0 0', fontSize: '32px', color: '#333' },
  iconBox: { width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#1e4b8f', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default Dashboard;