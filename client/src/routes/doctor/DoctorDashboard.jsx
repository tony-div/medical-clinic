import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserInjured, FaCheckCircle, FaSearch, FaClock, FaFileAlt, FaStethoscope, FaCalendarCheck } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY } from '../../data/initDB';
import './DoctorDashboard.css'; // New dedicated CSS file

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const currentUser = localStorage.getItem("currentUser");
    
    const [stats, setStats] = useState({ pendingToday: 0, totalCompleted: 0 });
    const [todayAppts, setTodayAppts] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    const [doctorName, setDoctorName] = useState("Doctor");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        // Set Doctor Name
        const rawName = currentUser.split('@')[0];
        const prettyName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        setDoctorName(prettyName);

        // Fetch Data
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const nameKey = currentUser.split('@')[0].toLowerCase();

        // Filter for this doctor
        const myAppts = allAppts.filter(a => 
            (a.doctor && a.doctor.toLowerCase().includes(nameKey)) || 
            (a.doctorName && a.doctorName.toLowerCase().includes(nameKey))
        );

        const today = new Date().toISOString().split('T')[0];

        // Stats Logic
        const todaysList = myAppts.filter(a => a.date === today && a.status === 'Scheduled');
        const totalTreatedCount = myAppts.filter(a => a.status === 'Completed').length;

        setStats({
            pendingToday: todaysList.length,
            totalCompleted: totalTreatedCount
        });

        // Sort by time
        todaysList.sort((a, b) => a.time.localeCompare(b.time));

        setTodayAppts(todaysList);
        setFilteredAppts(todaysList);

    }, [currentUser, navigate]);

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
                        <h1>Welcome, Dr. {doctorName}</h1>
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
                                                        <strong>{appt.patientName || "Unknown"}</strong>
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
                                            <p>No appointments found for today.</p>
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