import React, { useEffect, useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import PatientSidebar from '../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY, DB_PATIENTS_KEY } from '../data/initDB';
import './PatientDashboard.css';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    const [userName, setUserName] = useState("Patient");

    useEffect(() => {
        if (!currentUserEmail) return;

        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const foundUser = allPatients.find(p => p.email === currentUserEmail);
        
        if (foundUser) {
            setUserName(foundUser.name);
        }
    }, [currentUserEmail]);

    const [upcomingAppt, setUpcomingAppt] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const myAppts = allAppts.filter(a => a.patientEmail === currentUserEmail);
        myAppts.sort((a, b) => new Date(a.date) - new Date(b.date));

        const next = myAppts.find(a => a.status === 'Scheduled');
        setUpcomingAppt(next);

        const history = myAppts
            .filter(a => a.status !== 'Scheduled')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentHistory(history);
    }, [currentUserEmail, navigate]);

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>Hello, {userName} 👋</h1>
                    <p>Here is your health overview.</p>
                </header>

                <div className="dashboard-widgets">
                    {upcomingAppt ? (
                        <div className="widget-card highlight-card">
                            <h3>📅 Next Appointment</h3>
                            <div className="appt-info">
                                <div className="doctor-mini">
                                    <img src={upcomingAppt.image} alt="Doc" />
                                    <div>
                                        <h4>{upcomingAppt.doctorName}</h4>
                                        <span>{upcomingAppt.specialty}</span>
                                    </div>
                                </div>
                                <div className="time-box">
                                    <p>{upcomingAppt.date}</p>
                                    <h2>{upcomingAppt.time}</h2>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="widget-card highlight-card">
                            <h3>📅 Next Appointment</h3>
                            <p style={{marginTop: '10px', color: '#777'}}>No upcoming appointments scheduled.</p>
                        </div>
                    )}

                    <div className="widget-card action-card">
                        <h3>Quick Actions</h3>
                        <div className="btn-group">
                            <Link to="/doctors" className="action-btn primary" style={{width: '100%'}}>+ Book New Appointment</Link>
                        </div>
                    </div>
                </div>

                <div className="history-section">
                    <h3>Recent History</h3>
                    <table className="history-table">
                        <thead>
                            <tr><th>Date</th><th>Doctor</th><th>Status</th><th>Diagnosis</th></tr>
                        </thead>
                        <tbody>
                            {recentHistory.length > 0 ? (
                                recentHistory.slice(0, 3).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.date}</td>
                                        <td>{item.doctorName}</td>
                                        <td><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                        <td>{item.diagnosis || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{color:'#777'}}>No recent history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}