import React, { useEffect, useState } from 'react';
import { MdPeople, MdMedicalServices, MdEventAvailable } from 'react-icons/md';

// [MODIFIED] - Import API services instead of localStorage keys
import { getAllUsers } from '../../../services/users';
import { getDoctors } from '../../../services/doctors';
import { getAppointments } from '../../../services/appointment';

// [MODIFIED] - Accept refreshKey prop to trigger re-fetch when data changes
const Dashboard = ({ refreshKey }) => {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, todayAppts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [resUsers, resDocs, resAppts] = await Promise.all([
          getAllUsers(),
          getDoctors(),
          getAppointments()
        ]);

        const users = resUsers.data.users || [];
        const doctors = resDocs.data.data || [];
        const appointments = resAppts.data.appointments || [];

        // Count patients (users with role 'patient')
        const patientCount = users.filter(u => u.role === 'patient').length;

        // Count today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todaysCount = appointments.filter(a => a.date === today).length;

        setStats({
          patients: patientCount,
          doctors: doctors.length,
          todayAppts: todaysCount
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]); // [MODIFIED] - Re-fetch when refreshKey changes

  return (
    <div>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Dashboard</h2>
      {loading ? (
        <p style={{ color: '#666' }}>Loading stats...</p>
      ) : (
        <div style={styles.cardContainer}>
          <Card
            title="Total Patients"
            count={stats.patients}
            icon={<MdPeople />}
            borderColor="#1e4b8f"
          />
          <Card
            title="Total Doctors"
            count={stats.doctors}
            icon={<MdMedicalServices />}
            borderColor="#1e4b8f"
          />
          <Card
            title="Today's Appointments"
            count={stats.todayAppts}
            icon={<MdEventAvailable />}
            borderColor="#1e4b8f"
          />
        </div>
      )}
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
      {React.cloneElement(icon, { style: { color: '#fff', fontSize: '24px' } })}
    </div>
  </div>
);

const styles = {
  cardContainer: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  card: {
    flex: '1 1 280px',
    minWidth: '200px',
    maxWidth: '100%',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.2s'
  },
  cardTitle: { color: '#666', margin: 0, fontSize: '14px', fontWeight: '500' },
  cardCount: { margin: '8px 0 0 0', fontSize: '28px', color: '#333' },
  iconBox: { width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1e4b8f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
};

export default Dashboard;