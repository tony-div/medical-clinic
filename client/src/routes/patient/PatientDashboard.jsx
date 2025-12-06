import React, { useEffect, useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import { FaCalendarCheck, FaPlusCircle, FaUserMd, FaClock, FaFileMedicalAlt, FaExternalLinkAlt } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './PatientDashboard.css';

// 1. Import Services instead of DB keys
import { getAppointments } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    // Try to get name from local storage if saved during login, else default
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "Patient");
    
    const [upcomingAppt, setUpcomingAppt] = useState(null);
    const [recentHistory, setRecentHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0 });

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                // 2. Fetch Appointments and Doctors in parallel
                const [appointmentsRes, doctorsRes] = await Promise.all([
                    getAppointments(),
                    getDoctors()
                ]);

                const apiAppointments = appointmentsRes.data || [];
                const apiDoctors = doctorsRes.data || [];

                // 3. Filter for THIS patient (if API returns all)
                // Note: Ideally the API filters by token, but we double check here
                const myAppts = apiAppointments.filter(a => 
                    a.patientEmail === currentUserEmail || 
                    a.user_email === currentUserEmail // Check both cases depending on API response
                );

                // 4. Map API data to UI format (Match Doctor IDs to Names)
                const formattedAppts = myAppts.map(appt => {
                    // Find the doctor object for this appointment
                    const doc = apiDoctors.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                    
                    return {
                        ...appt,
                        // Map Backend fields -> Frontend UI fields
                        doctorName: doc ? doc.name : (appt.doctorName || "Unknown Doctor"),
                        specialty: doc ? doc.specialty : (appt.specialty || "General"),
                        image: doc ? doc.image : (appt.image || "/assets/default-doc.png"),
                        date: appt.date || appt.appointment_date, // Handle different naming conventions
                        time: appt.time || appt.starts_at,
                        status: appt.status || 'Scheduled'
                    };
                });
                
                // 5. Sort by date
                formattedAppts.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Find next scheduled
                const next = formattedAppts.find(a => a.status === 'Scheduled' || a.status === 'scheduled');
                setUpcomingAppt(next);

                // History (Newest first)
                const history = formattedAppts
                    .filter(a => a.status !== 'Scheduled' && a.status !== 'scheduled')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)); 
                
                setRecentHistory(history);

                // Stats
                setStats({
                    total: formattedAppts.length,
                    completed: formattedAppts.filter(a => a.status === 'Completed' || a.status === 'complete').length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();

    }, [currentUserEmail, navigate]);

    // Helper for status badge color
    const getStatusClass = (status) => {
        if (!status) return 'status-default';
        switch(status.toLowerCase()) {
            case 'completed': 
            case 'complete': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                
                {/* HEADER SECTION */}
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

                    {/* 2. ACTIVITY STATS */}
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

                {/* RECENT HISTORY TABLE */}
                <div className="history-section slide-up">
                    <h3>Recent History</h3>
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Diagnosis</th>
                                    <th>Action</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {recentHistory.length > 0 ? (
                                    recentHistory.slice(0, 3).map((item) => (
                                        <tr key={item.id} className="table-row">
                                            <td className="date-cell"><FaClock className="mini-icon"/> {item.date}</td>
                                            <td className="doc-cell"><FaUserMd className="mini-icon"/> {item.doctorName}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="diagnosis-text">{item.diagnosis || "-"}</td>
                                            
                                            <td>
                                                <button 
                                                    className="view-btn"
                                                    onClick={() => navigate(`/patient/appointment/${item.id}`)}
                                                >
                                                    View <FaExternalLinkAlt style={{fontSize:'10px'}}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-table">No recent history found.</td>
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