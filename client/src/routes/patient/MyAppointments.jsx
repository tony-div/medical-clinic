import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaClock, FaExternalLinkAlt, FaBan, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY } from '../../data/initDB'; 
import './MyAppointments.css';

export default function MyAppointments() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState("active"); 
    const [showCancelModal, setShowCancelModal] = useState(false); 
    const [selectedAppt, setSelectedAppt] = useState(null);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const myAppts = allAppts.filter(a => a.patientEmail === currentUserEmail);
        
        // Sort: Newest dates first
        myAppts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(myAppts);
    }, [currentUserEmail, navigate]);

    const activeList = appointments.filter(a => a.status === 'Scheduled');
    const historyList = appointments.filter(a => a.status !== 'Scheduled');

    const initiateCancel = (appt) => { setSelectedAppt(appt); setShowCancelModal(true); };

    const confirmCancel = () => {
        if (!selectedAppt) return;
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const updatedMainDB = allAppts.map(a => a.id === selectedAppt.id ? { ...a, status: "Cancelled" } : a);
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedMainDB));
        
        const myUpdatedAppts = updatedMainDB.filter(a => a.patientEmail === currentUserEmail);
        myUpdatedAppts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(myUpdatedAppts);
        setShowCancelModal(false);
    };

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>My Appointments</h1>
                        <p>Manage your upcoming visits and view history.</p>
                    </div>
                </header>

                {/* TABS */}
                <div className="tabs-wrapper">
                    <button 
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('active')}
                    >
                        Upcoming <span className="count-badge">{activeList.length}</span>
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>

                {/* TABLE CARD */}
                <div className="table-card">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Doctor</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === 'active' ? activeList : historyList).length > 0 ? (
                                (activeTab === 'active' ? activeList : historyList).map(appt => (
                                    <tr key={appt.id} className="table-row">
                                        <td>
                                            <div className="date-cell">
                                                <div className="date-icon-box">
                                                    <FaCalendarAlt />
                                                </div>
                                                <div>
                                                    <strong>{appt.date}</strong>
                                                    <span className="time-sub"><FaClock size={10}/> {appt.time}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-cell">
                                                <FaUserMd className="mini-icon"/> {appt.doctorName}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${appt.status.toLowerCase()}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {/* View Details (Always visible) */}
                                                <button 
                                                    className="btn-icon view" 
                                                    onClick={() => navigate(`/patient/appointment/${appt.id}`)}
                                                    title="View Details"
                                                >
                                                    <FaExternalLinkAlt /> View
                                                </button>

                                                {/* Cancel (Only for Scheduled) */}
                                                {appt.status === 'Scheduled' && (
                                                    <button 
                                                        className="btn-icon cancel" 
                                                        onClick={() => initiateCancel(appt)}
                                                        title="Cancel Appointment"
                                                    >
                                                        <FaBan /> Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        <div className="empty-content">
                                            <p>No {activeTab} appointments found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* CUSTOM WARNING POPUP (Replaces Browser Alert) */}
                {showCancelModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up warning-mode">
                            <div className="popup-icon-container">
                                <FaExclamationTriangle className="popup-icon warning" />
                            </div>
                            <h3 className="popup-title">Cancel Appointment?</h3>
                            <p className="popup-message">
                                Are you sure you want to cancel your visit with <strong>{selectedAppt?.doctorName}</strong> on {selectedAppt?.date}? This action cannot be undone.
                            </p>
                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowCancelModal(false)}>
                                    Keep Appointment
                                </button>
                                <button className="popup-btn danger" onClick={confirmCancel}>
                                    Yes, Cancel It
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}