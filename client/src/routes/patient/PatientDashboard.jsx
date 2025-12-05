import React, { useEffect, useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import { FaExternalLinkAlt, FaCalendarCheck, FaPlusCircle, FaUserMd, FaClock, FaNotesMedical } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY, DB_PATIENTS_KEY } from '../../data/initDB';
import './PatientDashboard.css';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [userName, setUserName] = useState("Patient");
    const [upcomingAppt, setUpcomingAppt] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        // 1. Get User Name
        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const foundUser = allPatients.find(p => p.email === currentUserEmail);
        if (foundUser) setUserName(foundUser.name);

        // 2. Get Appointments
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const myAppts = allAppts.filter(a => a.patientEmail === currentUserEmail);
        
        // Sort for upcoming
        myAppts.sort((a, b) => new Date(a.date) - new Date(b.date));
        const next = myAppts.find(a => a.status === 'Scheduled');
        setUpcomingAppt(next);

        // Sort for History (Newest first)
        const history = myAppts
            .filter(a => a.status !== 'Scheduled')
            .sort((a, b) => new Date(b.date) - new Date(a.date)); 
        
        setRecentHistory(history);
        setStats({
            total: myAppts.length,
            completed: myAppts.filter(a => a.status === 'Completed').length
        });

    }, [currentUserEmail, navigate]);

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                
                {/* HEADER SECTION */}
                <header className="dashboard-header">
                    <div className="header-text">
                        <h1>Welcome back, <span className="highlight-text">{userName}</span></h1>
                        <p>Track your appointments and health history.</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/doctors" className="primary-btn hover-scale">
                            <FaPlusCircle /> Book New Appointment
                        </Link>
                    </div>
                </header>

                {/* WIDGETS GRID */}
                <div className="dashboard-widgets">
                    
                    {/* 1. UPCOMING APPOINTMENT CARD */}
                    <div className="widget-card appointment-card hover-lift">
                        <div className="card-header">
                            <h3><FaCalendarCheck className="icon-blue"/> Next Appointment</h3>
                        </div>
                        
                        {upcomingAppt ? (
                            <div className="appt-content">
                                <div className="doctor-info">
                                    <div className="img-wrapper">
                                        <img src={upcomingAppt.image || "https://via.placeholder.com/150"} alt="Doc" />
                                    </div>
                                    <div>
                                        <h4>{upcomingAppt.doctorName}</h4>
                                        <span className="doc-specialty">{upcomingAppt.specialty}</span>
                                    </div>
                                </div>
                                <div className="appt-time">
                                    <div className="time-pill">
                                        <span className="label">Date</span>
                                        <strong>{upcomingAppt.date}</strong>
                                    </div>
                                    <div className="time-pill highlight-pill">
                                        <span className="label">Time</span>
                                        <strong>{upcomingAppt.time}</strong>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No upcoming visits scheduled.</p>
                                <Link to="/doctors" className="text-link">Find a Doctor &rarr;</Link>
                            </div>
                        )}
                    </div>

                    {/* 2. ACTIVITY STATS */}
                    <div className="widget-card stats-card hover-lift">
                        <div className="card-header">
                            <h3><FaNotesMedical className="icon-purple"/> Activity Summary</h3>
                        </div>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-val">{stats.total}</span>
                                <span className="stat-label">Total Visits</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <span className="stat-val">{stats.completed}</span>
                                <span className="stat-label">Completed</span>
                            </div>
                        </div>
                        <div className="stats-footer">
                            <Link to="/patient/records" className="secondary-link">View Medical Records &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* RECENT HISTORY TABLE */}
                <div className="history-section slide-up">
                    <div className="section-header">
                        <h3>Recent History</h3>
                        <Link to="/patient/appointments" className="view-all">View All</Link>
                    </div>
                    
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentHistory.length > 0 ? (
                                    recentHistory.slice(0, 3).map((item) => (
                                        <tr key={item.id} className="table-row">
                                            <td>
                                                <div className="date-cell">
                                                    <FaClock className="mini-icon"/> {item.date}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-cell">
                                                    <FaUserMd className="mini-icon"/> {item.doctorName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <Link 
                                                    to={`/patient/appointment/${item.id}`} 
                                                    className="view-details-btn"
                                                >
                                                    View <FaExternalLinkAlt size={12}/>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table">No history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}