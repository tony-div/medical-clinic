import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCalendarAlt, FaSearch, FaFilter, FaUserInjured, FaClock, FaStethoscope, FaEdit, FaBan, FaFileAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY } from '../../data/initDB'; 
import './DoctorAppointments.css'; 

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [appointments, setAppointments] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest"); 
    
    // Modals
    const [showReschedule, setShowReschedule] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    
    // --- 1. NEW STATE: Success Popup ---
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [selectedAppt, setSelectedAppt] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    // --- 1. LOAD DATA SAFELY ---
    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        try {
            // Safe Name Extraction
            const namePart = currentUserEmail.split('@')[0];
            const nameKey = namePart ? namePart.toLowerCase() : "";

            const rawData = localStorage.getItem(DB_APPOINTMENTS_KEY);
            const allAppts = rawData ? JSON.parse(rawData) : [];
            
            if (!Array.isArray(allAppts)) {
                console.error("Data corrupted: Appointments is not an array");
                setAppointments([]);
                return;
            }

            // Safe Filtering
            const myAppts = allAppts.filter(a => {
                const doc1 = typeof a.doctor === 'string' ? a.doctor.toLowerCase() : "";
                const doc2 = typeof a.doctorName === 'string' ? a.doctorName.toLowerCase() : "";
                return doc1.includes(nameKey) || doc2.includes(nameKey);
            });
            
            setAppointments(myAppts);

        } catch (err) {
            console.error("Crash prevented:", err);
            setAppointments([]); // Fallback to empty list
        }
    }, [currentUserEmail, navigate]);

    // --- 2. FILTER & SORT SAFELY ---
    useEffect(() => {
        let results = [...appointments];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            results = results.filter(a => {
                const pName = typeof a.patientName === 'string' ? a.patientName.toLowerCase() : "";
                const status = typeof a.status === 'string' ? a.status.toLowerCase() : "";
                return pName.includes(lowerSearch) || status.includes(lowerSearch);
            });
        }

        results.sort((a, b) => {
            // Default to today if date is missing/invalid
            const dateA = a.date ? new Date(a.date) : new Date();
            const dateB = b.date ? new Date(b.date) : new Date();
            
            if (sortOrder === 'newest') {
                return dateB - dateA; 
            } else {
                return dateA - dateB; 
            }
        });

        setFilteredAppts(results);
    }, [searchTerm, appointments, sortOrder]); 


    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }
        try {
            const rawData = localStorage.getItem(DB_APPOINTMENTS_KEY);
            const allAppts = rawData ? JSON.parse(rawData) : [];
            const name = currentUserEmail.split('@')[0].toLowerCase();
            const myAppts = allAppts.filter(a => {
                if (!a) return false;
                const dName = a.doctorName ? String(a.doctorName).toLowerCase() : "";
                const dDoc = a.doctor ? String(a.doctor).toLowerCase() : "";
                return dName.includes(name) || dDoc.includes(name);
            });
            setAppointments(myAppts);
        } catch (error) { console.error(error); }
    }, [currentUserEmail, navigate]);

    useEffect(() => {
        let results = [...appointments];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            results = results.filter(a => {
                const pName = a.patientName ? String(a.patientName).toLowerCase() : "";
                const status = a.status ? String(a.status).toLowerCase() : "";
                return pName.includes(lowerSearch) || status.includes(lowerSearch);
            });
        }
        results.sort((a, b) => {
            const dateA = new Date(a.date || Date.now());
            const dateB = new Date(b.date || Date.now());
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setFilteredAppts(results);
    }, [searchTerm, appointments, sortOrder]);

    // --- HANDLERS ---

    const initiateCancel = (appt) => { setSelectedAppt(appt); setShowCancelModal(true); };

    const confirmCancel = () => {
        if (!selectedAppt) return;
        const updatedList = appointments.map(a => a.id === selectedAppt.id ? { ...a, status: "Cancelled" } : a);
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedList));
        setAppointments(updatedList);
        setShowCancelModal(false);
    };

    const openReschedule = (appt) => {
        setSelectedAppt(appt);
        setNewDate(appt.date || "");
        setNewTime(appt.time || "");
        setShowReschedule(true);
    };

    // --- 2. UPDATED HANDLER: Show Success Popup ---
    const submitReschedule = () => {
        const updatedList = appointments.map(a => a.id === selectedAppt.id ? { ...a, date: newDate, time: newTime } : a);
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedList));
        setAppointments(updatedList);
        
        setShowReschedule(false); // Close Form
        setShowSuccessModal(true); // Open Success Popup
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
                        <h1>Manage Appointments</h1>
                        <p>View, reschedule, or cancel patient visits.</p>
                    </div>
                </header>

                <div className="toolbar-card">
                    <div className="search-group">
                        <FaSearch className="search-icon"/>
                        <input 
                            type="text" 
                            placeholder="Search patient or status..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
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
                                <th>Patient Details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppts.length > 0 ? (
                                filteredAppts.map((appt, index) => {
                                    if (!appt) return null;
                                    return (
                                        <tr key={appt.id || index} className="table-row">
                                            <td>
                                                <div className="date-wrapper">
                                                    <div className="icon-box-date"><FaCalendarAlt /></div>
                                                    <div>
                                                        <span className="date-text">{String(appt.date || "N/A")}</span>
                                                        <span className="time-sub"><FaClock size={10}/> {String(appt.time || "--:--")}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="patient-wrapper">
                                                    <div className="avatar-circle"><FaUserInjured /></div>
                                                    <div>
                                                        <Link to={`/doctor/patient-profile/${appt.patientEmail || "#"}`} className="patient-link">
                                                            {String(appt.patientName || "Unknown")}
                                                        </Link>
                                                        <div className="reason-sub">"{String(appt.reason || "-")}"</div>
                                                        {appt.uploadedFiles && <span className="file-badge"><FaFileAlt size={10}/> File Attached</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(appt.status)}`}>
                                                    {String(appt.status || "Scheduled")}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-row">
                                                    {(appt.status === 'Scheduled' || !appt.status) && (
                                                        <>
                                                            <button className="icon-btn diagnose" title="Diagnose" onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}><FaStethoscope /></button>
                                                            <button className="icon-btn reschedule" title="Reschedule" onClick={() => openReschedule(appt)}><FaEdit /></button>
                                                            <button className="icon-btn cancel" title="Cancel" onClick={() => initiateCancel(appt)}><FaBan /></button>
                                                        </>
                                                    )}
                                                    {appt.status === 'Completed' && (
                                                        <button className="btn-text view" onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}>View Details</button>
                                                    )}
                                                    {appt.status === 'Cancelled' && <span className="cancelled-text">-</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="4" className="empty-state">No appointments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL 1: RESCHEDULE FORM */}
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
                                <select value={newTime} onChange={e => setNewTime(e.target.value)} className="modal-input">
                                    <option>09:00 AM</option>
                                    <option>10:30 AM</option>
                                    <option>01:00 PM</option>
                                    <option>03:30 PM</option>
                                    <option>05:00 PM</option>
                                </select>
                            </div>
                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
                                <button className="popup-btn primary" onClick={submitReschedule}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 2: CANCEL WARNING */}
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

                {/* --- 3. MODAL 3: SUCCESS CONFIRMATION --- */}
                {showSuccessModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <div className="popup-icon-container">
                                <FaCheckCircle className="popup-icon success" />
                            </div>
                            <h3 className="popup-title">Rescheduled!</h3>
                            <p className="popup-message">
                                The appointment has been successfully moved to <strong>{newDate}</strong> at <strong>{newTime}</strong>.
                            </p>
                            <button className="popup-btn primary" onClick={() => setShowSuccessModal(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}