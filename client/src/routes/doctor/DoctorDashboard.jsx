import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserInjured, FaCheckCircle, FaSearch, FaClock, FaFileAlt, FaStethoscope, FaCalendarCheck } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import './DoctorDashboard.css';

// ✅ Services
import { getAppointments } from '../../services/appointment';
import { getUser } from '../../services/users';
import { getMedicalTestByAppointmentId } from '../../services/medical-tests';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    
    // ✅ 1. Get Logged In Doctor
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const [doctorName, setDoctorName] = useState(currentUser.name || "Doctor");
    
    const [stats, setStats] = useState({ pendingToday: 0, totalCompleted: 0 });
    const [todayAppts, setTodayAppts] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Base URL for file links
    const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!currentUser.id || currentUser.role !== 'doctor') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // ✅ 2. Fetch Doctor's Appointments
                const res = await getAppointments();
                // Safe unwrap (Backend might return { appointments: [...] } or { Appointments: [...] } or just [...])
                const allAppts = Array.isArray(res.data) 
                    ? res.data 
                    : (res.data.appointments || res.data.Appointments || []);

                // Stats: Total Completed (Lifetime)
                const totalCompleted = allAppts.filter(a => 
                    (a.status || "").toLowerCase() === 'complete' || (a.status || "").toLowerCase() === 'completed'
                ).length;

                // Filter for TODAY only
                const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (Local)
                
                const todaysList = allAppts.filter(a => {
                    const apptDate = new Date(a.date).toLocaleDateString('en-CA');
                    const isToday = apptDate === todayStr;
                    const isScheduled = (a.status || "").toLowerCase() === 'scheduled';
                    return isToday && isScheduled;
                });

                // ✅ 3. Hydrate Today's List (Get Patient Name & Tests)
                const hydratedList = await Promise.all(todaysList.map(async (appt) => {
                    // A. Fetch Patient Details
                    let patientName = "Unknown";
                    let patientEmail = "";
                    if (appt.user_id) {
                        try {
                            const userRes = await getUser(appt.user_id);
                            const u = userRes.data.user || userRes.data;
                            patientName = u.name;
                            patientEmail = u.email;
                        } catch (e) { console.error("Could not fetch patient", appt.user_id); }
                    }

                    // B. Fetch Medical Test (if any)
                    let fileUrl = null;
                    try {
                        const testRes = await getMedicalTestByAppointmentId(appt.id);
                        const tests = testRes.data.medicalTest;
                        if (Array.isArray(tests) && tests.length > 0) {
                            fileUrl = tests[0].file_path;
                            if (fileUrl && !fileUrl.startsWith('http')) {
                                fileUrl = `${API_BASE_URL}${fileUrl}`;
                            }
                        }
                    } catch (e) { /* No test found is okay */ }

                    return {
                        ...appt,
                        patientName,
                        patientEmail,
                        uploadedFiles: fileUrl,
                        // Fix Time Format (HH:MM:SS -> HH:MM)
                        time: appt.starts_at ? appt.starts_at.substring(0, 5) : "00:00"
                    };
                }));

                // Sort by time
                hydratedList.sort((a, b) => a.time.localeCompare(b.time));

                setTodayAppts(hydratedList);
                setFilteredAppts(hydratedList);
                setStats({
                    pendingToday: hydratedList.length,
                    totalCompleted
                });

            } catch (error) {
                console.error("Error loading doctor dashboard:", error);
            }
        };

        fetchData();
    }, [currentUser.id, navigate]);

    // Search Logic
    useEffect(() => {
        const results = todayAppts.filter(appt => 
            (appt.patientName && appt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (appt.reason && appt.reason.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredAppts(results);
    }, [searchTerm, todayAppts]);

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome, {doctorName}</h1>
                        <p>Here is your daily activity overview.</p>
                    </div>
                    <div className="date-badge">
                        <FaCalendarCheck /> {new Date().toLocaleDateString()}
                    </div>
                </header>

                {/* WIDGETS */}
                <div className="dashboard-widgets">
                    <div className="widget-card hover-lift pending-card">
                        <div className="card-header">
                            <h3><FaClock className="icon-blue"/> Pending Today</h3>
                        </div>
                        <div className="stat-content">
                            <span className="stat-val">{stats.pendingToday}</span>
                            <span className="stat-label">Patients Waiting</span>
                        </div>
                    </div>

                    <div className="widget-card hover-lift success-card">
                        <div className="card-header">
                            <h3><FaCheckCircle className="icon-green"/> Total Treated</h3>
                        </div>
                        <div className="stat-content">
                            <span className="stat-val">{stats.totalCompleted}</span>
                            <span className="stat-label">Lifetime Patients</span>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="table-section">
                    <div className="section-header">
                        <h3>Today's Schedule</h3>
                        <div className="search-box">
                            <FaSearch className="search-icon"/>
                            <input 
                                type="text" 
                                placeholder="Search patient..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-card">
                        <table className="doctor-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Patient Details</th>
                                    <th>Reason for Visit</th>
                                    <th>Tests</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppts.length > 0 ? (
                                    filteredAppts.map(appt => (
                                        <tr key={appt.id} className="table-row">
                                            {/* Time */}
                                            <td>
                                                <div className="time-badge">
                                                    {appt.time}
                                                </div>
                                            </td>
                                            
                                            {/* Patient */}
                                            <td>
                                                <div className="patient-info">
                                                    <div className="avatar-small">
                                                        <FaUserInjured />
                                                    </div>
                                                    <div>
                                                        <strong>{appt.patientName}</strong>
                                                        <span className="sub-text">{appt.patientEmail}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td>
                                                <span className="reason-text">"{appt.reason || "General Checkup"}"</span>
                                            </td>

                                            {/* Files */}
                                            <td>
                                                {appt.uploadedFiles ? (
                                                    <a href={appt.uploadedFiles} target="_blank" rel="noreferrer" className="file-link">
                                                        <FaFileAlt /> View File
                                                    </a>
                                                ) : (
                                                    <span className="no-file">-</span>
                                                )}
                                            </td>

                                            {/* Action */}
                                            <td>
                                                <button 
                                                    className="start-visit-btn"
                                                    onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}
                                                >
                                                    <FaStethoscope /> Start Visit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            <p>No appointments scheduled for today.</p>
                                        </td>
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