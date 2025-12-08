import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSearch, FaFilter, FaUserInjured, FaClock, FaStethoscope, FaEdit, FaBan, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import './DoctorAppointments.css'; 


import { getAppointments, updateAppointment } from '../../services/appointment';
import { getUser } from '../../services/users';

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const [isLoading, setIsLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest"); 
    
    // Modals
    const [showReschedule, setShowReschedule] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [selectedAppt, setSelectedAppt] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    // --- 1. LOAD DATA FROM API ---
    useEffect(() => {
        if (!currentUser.id || currentUser.role !== 'doctor') { 
            navigate('/login'); 
            return; 
        }

        const fetchData = async () => {
            try {
                // A. Fetch Appointments
                const res = await getAppointments();
                const allAppts = Array.isArray(res.data) 
                    ? res.data 
                    : (res.data.appointments || res.data.Appointments || []);

                // B. Hydrate with Patient Info (Names)
                // We need to fetch User details for every appointment to get the Patient Name
                const hydratedList = await Promise.all(allAppts.map(async (appt) => {
                    let patientName = "Unknown";
                    let patientEmail = "";
                    
                    if (appt.user_id) {
                        try {
                            const userRes = await getUser(appt.user_id);
                            const u = userRes.data.user || userRes.data;
                            patientName = u.name;
                            patientEmail = u.email;
                        } catch (e) {
                            console.error("Error fetching patient:", appt.user_id);
                        }
                    }

                    return {
                        ...appt,
                        id: appt.id,
                        patientName,
                        patientEmail,
                        // Format Data for Display
                        dateDisplay: new Date(appt.date).toLocaleDateString('en-CA'),
                        timeDisplay: appt.starts_at ? appt.starts_at.substring(0, 5) : "00:00",
                        // Normalize Status
                        status: appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Scheduled'
                    };
                }));

                setAppointments(hydratedList);
                setFilteredAppts(hydratedList);

            } catch (err) {
                console.error("Error loading appointments:", err);
            }
        };

        fetchData();
    }, [currentUser.id, navigate]);

    // --- 2. FILTER & SORT ---
    useEffect(() => {
        let results = [...appointments];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            results = results.filter(a => 
                (a.patientName && a.patientName.toLowerCase().includes(lowerSearch)) ||
                (a.status && a.status.toLowerCase().includes(lowerSearch))
            );
        }

        results.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (sortOrder === 'newest') {
                return dateB - dateA; 
            } else {
                return dateA - dateB; 
            }
        });

        setFilteredAppts(results);
    }, [searchTerm, appointments, sortOrder]); 


    // --- HANDLERS (CONNECTED TO API) ---

    const initiateCancel = (appt) => { setSelectedAppt(appt); setShowCancelModal(true); };

    const confirmCancel = async () => {
        if (!selectedAppt) return;
        try {
            // API Call: Update status to 'cancelled'
            setIsLoading(true); 
            await updateAppointment(selectedAppt.id, { status: "cancelled" });

            // Optimistic UI Update
            const updatedList = appointments.map(a => 
                a.id === selectedAppt.id ? { ...a, status: "Cancelled" } : a
            );
            setAppointments(updatedList);
            setIsLoading(false); 
            setShowCancelModal(false);
        } catch (error) {
            setIsLoading(false); 
            alert("Failed to cancel appointment.");
        }
    };

    const openReschedule = (appt) => {
        setSelectedAppt(appt);
        // Pre-fill inputs with current data (YYYY-MM-DD)
        const dateStr = new Date(appt.date).toISOString().split('T')[0];
        setNewDate(dateStr);
        setNewTime(appt.starts_at || "09:00");
        setShowReschedule(true);
    };

    const submitReschedule = async () => {
        if (!newDate || !newTime) return;
        try {
            setIsLoading(true); 
            // API Call: Update Date & Time
            await updateAppointment(selectedAppt.id, { 
                date: newDate,
                starts_at: newTime,
                status: "rescheduled"
            });

            // Optimistic UI Update
            const updatedList = appointments.map(a => 
                a.id === selectedAppt.id ? { 
                    ...a, 
                    date: newDate, 
                    dateDisplay: new Date(newDate).toLocaleDateString('en-CA'),
                    starts_at: newTime,
                    timeDisplay: newTime,
                    status: "Rescheduled"
                } : a
            );
            setAppointments(updatedList);
            setIsLoading(false); 
            setShowReschedule(false); 
            setShowSuccessModal(true); 
        } catch (error) {
            setIsLoading(false); 
            alert("Failed to reschedule. Please try again.");
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'scheduled';
        return String(status).toLowerCase();
    };

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            
            <main className="dashboard-main fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1>My Appointments</h1>
                        <p>Manage your schedule and patient visits.</p>
                    </div>
                </header>

                <div className="toolbar-card">
                    <div className="search-group">
                        <FaSearch className="search-icon"/>
                        <input 
                            type="text" 
                            placeholder="Search patient name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <FaFilter className="filter-icon"/>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                <div className="table-card">
                    <table className="doctor-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Patient</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppts.length > 0 ? (
                                filteredAppts.map((appt) => (
                                    <tr key={appt.id} className="table-row">
                                        <td>
                                            <div className="date-wrapper">
                                                <div className="icon-box-date"><FaCalendarAlt /></div>
                                                <div>
                                                    <span className="date-text">{appt.dateDisplay}</span>
                                                    <span className="time-sub"><FaClock size={10}/> {appt.timeDisplay}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="patient-info">
                                                <div className="avatar-small"><FaUserInjured /></div>
                                                <div>
                                                    <strong>{appt.patientName}</strong>
                                                    <span className="sub-text">{appt.reason || "General Checkup"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                {/* Only allow actions if not cancelled/completed */}
                                                {(appt.status !== 'Cancelled' && appt.status !== 'Completed' && appt.status !== 'Complete') && (
                                                    <>
                                                        <button className="icon-btn diagnose" title="Diagnose" onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}>
                                                            <FaStethoscope />
                                                        </button>
                                                        <button className="icon-btn reschedule" title="Reschedule" onClick={() => openReschedule(appt)}>
                                                            <FaEdit />
                                                        </button>
                                                        <button className="icon-btn cancel" title="Cancel" onClick={() => initiateCancel(appt)}>
                                                            <FaBan />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* If completed, just show View button */}
                                                {(appt.status === 'Completed' || appt.status === 'Complete') && (
                                                    <button className="btn-text view" onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}>
                                                        View Details
                                                    </button>
                                                )}
                                                
                                                {appt.status === 'Cancelled' && <span className="cancelled-text">-</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-state">No appointments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- MODAL 1: RESCHEDULE --- */}
                {showReschedule && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <h3 className="popup-title">Reschedule Appointment</h3>
                            <div className="form-group-modal">
                                <label>New Date</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="modal-input" />
                            </div>
                            <div className="form-group-modal">
                                <label>New Time</label>
                                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="modal-input" />
                            </div>
                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
                                <button className="popup-btn primary" onClick={submitReschedule}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL 2: CANCEL WARNING --- */}
                {showCancelModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up warning-mode">
                            <div className="popup-icon-container"><FaExclamationTriangle className="popup-icon warning" /></div>
                            <h3 className="popup-title">Cancel Appointment?</h3>
                            <p className="popup-message">This action cannot be undone.</p>
                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowCancelModal(false)}>No</button>
                                <button className="popup-btn danger" onClick={confirmCancel}>Yes, Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL 3: SUCCESS --- */}
                {showSuccessModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <div className="popup-icon-container">
                                <FaCheckCircle className="popup-icon success" />
                            </div>
                            <h3 className="popup-title">Success!</h3>
                            <p className="popup-message">The appointment has been updated.</p>
                            <button className="popup-btn primary" onClick={() => setShowSuccessModal(false)}>Done</button>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Please wait…</p>
                    </div>
                )}

            </main>
        </div>
    );
}