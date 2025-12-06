import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaClock, FaExternalLinkAlt, FaBan, FaExclamationTriangle } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './MyAppointments.css';

import { getAppointmentsByUserId, updateAppointment } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';

export default function MyAppointments() {
    const navigate = useNavigate();
    
    // Get ID
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = storedUser.id;
    
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState("active"); 
    const [showCancelModal, setShowCancelModal] = useState(false); 
    const [selectedAppt, setSelectedAppt] = useState(null);

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                // Fetch User's Appts & Doctors
                const [apptRes, docRes] = await Promise.all([
                    getAppointmentsByUserId(userId),
                    getDoctors()
                ]);

                // Safe Unwrap
                const apiAppts = Array.isArray(apptRes.data) 
                    ? apptRes.data 
                    : (apptRes.data.appointments || apptRes.data.data || []);

                const apiDocs = Array.isArray(docRes.data) 
                    ? docRes.data 
                    : (docRes.data.doctors || docRes.data.data || []);

                // Map
                const mappedAppts = apiAppts.map(appt => {
                    const doc = apiDocs.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                    return {
                        ...appt,
                        id: appt.id,
                        date: appt.date ? appt.date.toString().split('T')[0] : "",
                        time: appt.time || appt.starts_at,
                        status: appt.status || 'Scheduled',
                        doctorName: doc ? doc.name : "Unknown Doctor",
                        specialty: doc ? doc.specialty : "General"
                    };
                });

                mappedAppts.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAppointments(mappedAppts);

            } catch (error) {
                console.error("Error loading appointments:", error);
            }
        };

        fetchData();
    }, [userId, navigate]);

    // Filter Logic
    const activeList = appointments.filter(a => (a.status || "").toLowerCase() === 'scheduled');
    const historyList = appointments.filter(a => (a.status || "").toLowerCase() !== 'scheduled');

    const initiateCancel = (appt) => { setSelectedAppt(appt); setShowCancelModal(true); };

    const confirmCancel = async () => {
        if (!selectedAppt) return;
        try {
            await updateAppointment(selectedAppt.id, { status: "Cancelled" });
            
            // Optimistic update
            const updatedList = appointments.map(a => 
                a.id === selectedAppt.id ? { ...a, status: "Cancelled" } : a
            );
            
            updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(updatedList);
            setShowCancelModal(false);
        } catch (error) {
            alert("Failed to cancel. Please try again.");
        }
    };

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1>My Appointments</h1>
                        <p>Manage your upcoming visits and view history.</p>
                    </div>
                </header>

                <div className="tabs-wrapper">
                    <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                        Upcoming <span className="count-badge">{activeList.length}</span>
                    </button>
                    <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                        History
                    </button>
                </div>

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
                                                <div className="date-icon-box"><FaCalendarAlt /></div>
                                                <div>
                                                    <strong>{appt.date}</strong>
                                                    <span className="time-sub"><FaClock size={10}/> {appt.time}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><div className="doc-cell"><FaUserMd className="mini-icon"/> {appt.doctorName}</div></td>
                                        <td><span className={`status-badge ${appt.status ? appt.status.toLowerCase() : 'default'}`}>{appt.status}</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon view" onClick={() => navigate(`/patient/appointment/${appt.id}`)}><FaExternalLinkAlt /> View</button>
                                                {(appt.status || "").toLowerCase() === 'scheduled' && (
                                                    <button className="btn-icon cancel" onClick={() => initiateCancel(appt)}><FaBan /> Cancel</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-state"><p>No {activeTab} appointments found.</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showCancelModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up warning-mode">
                            <div className="popup-icon-container"><FaExclamationTriangle className="popup-icon warning" /></div>
                            <h3 className="popup-title">Cancel Appointment?</h3>
                            <p className="popup-message">Are you sure you want to cancel your visit with <strong>{selectedAppt?.doctorName}</strong>?</p>
                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowCancelModal(false)}>Keep Appointment</button>
                                <button className="popup-btn danger" onClick={confirmCancel}>Yes, Cancel It</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}