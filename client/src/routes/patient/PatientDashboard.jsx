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
        console.warn("⛔ No User ID found in localStorage. Redirecting.");
        navigate('/login'); 
        return; 
    }

    const fetchData = async () => {
        try {
            console.log("🔍 STEP 1: Current User ID is:", userId);

            // Fetch Appointments
            const [appointmentsRes, doctorsRes] = await Promise.all([
   getAppointments(), // <--- No ID needed! It uses your token.
   getDoctors()
]);
            console.log("🔍 STEP 2: Raw API Response:", appointmentsRes);
            
            // Check exactly what the backend sent back
            const rawData = appointmentsRes.data;
            console.log("🔍 STEP 3: Response .data property:", rawData);
            
            // UNWRAPPING LOGIC WITH DEBUGGING
            let apiAppointments = [];
            
            if (Array.isArray(rawData)) {
                console.log("✅ Data is an Array immediately.");
                apiAppointments = rawData;
            } else if (rawData.appointments && Array.isArray(rawData.appointments)) {
                 console.log("✅ Data found inside .appointments key");
                apiAppointments = rawData.appointments;
            } else if (rawData.data && Array.isArray(rawData.data)) {
                 console.log("✅ Data found inside .data key");
                apiAppointments = rawData.data;
            } else {
                console.error("❌ Could not find array in response. Keys found:", Object.keys(rawData));
            }

            console.log("🔍 STEP 4: Final array to be mapped:", apiAppointments);

            const apiDoctors = Array.isArray(doctorsRes.data) 
                ? doctorsRes.data 
                : (doctorsRes.data?.doctors || doctorsRes.data?.data || []);

                console.log("✅ Unwrapped Appointments:", apiAppointments);

                // Map Data
                const formattedAppts = apiAppointments.map(appt => {
                    const doc = apiDoctors.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                    
                    return {
                        ...appt,
                        id: appt.id,
                        // Handle date strictly
                        date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : "N/A",
                        time: appt.time || appt.starts_at || "00:00",
                        status: (appt.status || 'Scheduled').charAt(0).toUpperCase() + (appt.status || 'Scheduled').slice(1), // Capitalize
                        diagnosis: appt.diagnosis,
                        doctorName: doc ? doc.name : "Unknown Doctor",
                        specialty: doc ? doc.specialty : "General",
                        image: doc ? doc.image : "/assets/default-doc.png"
                    };
                });
                
                // Sort
                formattedAppts.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Find Upcoming (Must be Scheduled AND in the future/today)
                // Note: Since we are debugging, let's just show ANY 'Scheduled' as upcoming
                const next = formattedAppts.find(a => a.status === 'Scheduled');
                setUpcomingAppt(next || null);

                // History (Everything else)
                const history = formattedAppts
                    .filter(a => a.status !== 'Scheduled')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
                
                setRecentHistory(history);

                setStats({
                    total: formattedAppts.length,
                    completed: formattedAppts.filter(a => a.status === 'Completed').length
                });

           } catch (error) {
            console.error("⚠️ Error fetching dashboard data:", error);
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