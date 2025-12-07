import React, { useEffect, useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import { FaCalendarCheck, FaPlusCircle, FaUserMd, FaClock, FaFileMedicalAlt, FaExternalLinkAlt } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './PatientDashboard.css';
import { getAppointments } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';

export default function PatientDashboard() {
    const navigate = useNavigate();
    
    // Get Session
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = storedUser.id;
    const userName = storedUser.name || "Patient";

    const [upcomingAppt, setUpcomingAppt] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        if (!userId) { 
            navigate('/login'); 
            return; 
        }

        const fetchData = async () => {
            try {
                // Fetch Appointments & Doctors
                const [appointmentsRes, doctorsRes] = await Promise.all([
                    getAppointments(),
                    getDoctors()
                ]);
                
                // Safe Unwrap
                const apiAppointments = Array.isArray(appointmentsRes.data) 
                    ? appointmentsRes.data 
                    : (appointmentsRes.data?.appointments || appointmentsRes.data?.data || []);

                const apiDoctors = Array.isArray(doctorsRes.data) 
                    ? doctorsRes.data 
                    : (doctorsRes.data?.doctors || doctorsRes.data?.data || []);

                // Map Data
                const formattedAppts = apiAppointments.map(appt => {
                    const doc = apiDoctors.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                    
                    return {
                        ...appt,
                        id: appt.id,
                        // Fix Date Bug: Use Local Date String
                        date: appt.date ? new Date(appt.date).toLocaleDateString('en-CA') : "N/A",
                        time: appt.time || appt.starts_at || "00:00",
                        status: (appt.status || 'Scheduled').charAt(0).toUpperCase() + (appt.status || 'Scheduled').slice(1), 
                        doctorName: doc ? doc.name : "Unknown Doctor",
                        specialty: doc ? doc.specialty : "General",
                        image: doc ? doc.image : "/assets/default-doc.png"
                    };
                });
                
                formattedAppts.sort((a, b) => new Date(a.date) - new Date(b.date));

                const next = formattedAppts.find(a => a.status === 'Scheduled');
                setUpcomingAppt(next || null);

                const history = formattedAppts
                    .filter(a => a.status !== 'Scheduled')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)); 
                
                setRecentHistory(history);

                setStats({
                    total: formattedAppts.length,
                    completed: formattedAppts.filter(a => a.status === 'Completed').length
                });

           } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
        };

        fetchData();

    }, [userId, navigate]);

    const getStatusClass = (status) => {
        if (!status) return 'status-default';
        switch(status.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome back, <span className="highlight-text">{userName}</span></h1>
                        <p>Here is your daily health overview.</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/doctors" className="primary-btn hover-scale">
                            <FaPlusCircle /> Book New Appointment
                        </Link>
                    </div>
                </header>

                <div className="dashboard-widgets">
                    <div className="widget-card appointment-card hover-lift">
                        <div className="card-header">
                            <h3><FaCalendarCheck className="icon-blue"/> Next Appointment</h3>
                        </div>
                        {upcomingAppt ? (
                            <div className="appt-content">
                                <div className="doctor-info">
                                    <div className="img-wrapper">
                                        <img src={upcomingAppt.image} alt="Doc" />
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

                    <div className="widget-card stats-card hover-lift">
                        <div className="card-header">
                            <h3><FaFileMedicalAlt className="icon-purple"/> Activity Summary</h3>
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

                <div className="history-section slide-up">
                    <h3>Recent History</h3>
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    {/* WIDTHS ensure columns stay aligned */}
                                    <th style={{width: '25%'}}>Date</th>
                                    <th style={{width: '35%'}}>Doctor</th>
                                    <th style={{width: '20%'}}>Status</th>
                                    <th style={{width: '20%', textAlign: 'right'}}>Action</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {recentHistory.length > 0 ? (
                                    recentHistory.slice(0, 3).map((item) => (
                                        <tr key={item.id} className="table-row">
                                            <td>
                                                {/* Wrapper div safely holds the icon and text */}
                                                <div className="date-cell">
                                                    <FaClock className="mini-icon"/> <span>{item.date}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-cell">
                                                    <FaUserMd className="mini-icon"/> <span>{item.doctorName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{textAlign: 'right'}}>
                                                <button 
                                                    className="view-details-btn"
                                                    onClick={() => navigate(`/patient/appointment/${item.id}`)}
                                                >
                                                    View <FaExternalLinkAlt style={{fontSize:'10px'}}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table">No recent history found.</td>
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