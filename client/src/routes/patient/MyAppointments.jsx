import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>My Appointments</h1>
                    <div className="tabs-container">
                        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Upcoming</button>
                        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
                    </div>
                </header>

                <div className="appointments-container">
                    <table className="appointments-table">
                        <thead><tr><th>Date & Time</th><th>Doctor</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {(activeTab === 'active' ? activeList : historyList).length > 0 ? (
                                (activeTab === 'active' ? activeList : historyList).map(appt => (
                                    <tr key={appt.id}>
                                        <td><strong>{appt.date}</strong><br/><span style={{fontSize:'0.85rem', color:'#777'}}>{appt.time}</span></td>
                                        <td>{appt.doctorName}</td>
                                        <td><span className={`status-badge ${appt.status.toLowerCase()}`}>{appt.status}</span></td>
                                        <td>
                                            {appt.status === 'Scheduled' && (
                                                <div style={{display:'flex', gap:'5px'}}>
                                                    <button className="btn-action" style={{background:'#3498DB', color:'white'}} onClick={() => navigate(`/patient/appointment/${appt.id}`)}>
                                                        View Details
                                                    </button>
                                                    <button className="btn-action cancel" onClick={() => initiateCancel(appt)}>Cancel</button>
                                                </div>
                                            )}
                                            {appt.status === 'Completed' && (
                                                <button className="btn-action review" style={{background:'#27AE60'}} onClick={() => navigate(`/patient/appointment/${appt.id}`)}>
                                                    View Details
                                                </button>
                                            )}
                                            {appt.status === 'Cancelled' && <span className="text-muted">-</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#888'}}>No appointments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cancel Appointment?</h3>
                        <p>Are you sure?</p>
                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowCancelModal(false)}>No</button>
                            <button className="btn primary danger" onClick={confirmCancel}>Yes, Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}