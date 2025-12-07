import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaClock, FaExternalLinkAlt, FaBan, FaExclamationTriangle, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import PatientSidebar from '../../components/PatientSidebar';
import './MyAppointments.css';
import { getAppointments, updateAppointment } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';

export default function MyAppointments() {
    const navigate = useNavigate();
    
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = storedUser.id;
    
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("active"); 
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");

    const [showCancelModal, setShowCancelModal] = useState(false); 
    const [selectedAppt, setSelectedAppt] = useState(null);

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                const [apptRes, docRes] = await Promise.all([
                    getAppointments(),
                    getDoctors()
                ]);

                const apiAppts = Array.isArray(apptRes.data) 
                    ? apptRes.data 
                    : (apptRes.data.appointments || apptRes.data.data || []);

                const apiDocs = Array.isArray(docRes.data) 
                    ? docRes.data 
                    : (docRes.data.doctors || docRes.data.data || []);

                const mappedAppts = apiAppts.map(appt => {
                    const doc = apiDocs.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                    return {
                        ...appt,
                        id: appt.id,
                        rawDate: new Date(appt.date),
                        date: appt.date ? new Date(appt.date).toLocaleDateString('en-CA') : "",
                        time: appt.time || appt.starts_at,
                        status: appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : 'Scheduled',
                        // Safety: Ensure these are strings, default to empty string if missing
                        doctorName: doc && doc.name ? doc.name : "Unknown Doctor",
                        specialty: doc && doc.specialty ? doc.specialty : "General"
                    };
                });

                setAppointments(mappedAppts);
                setLoading(false);

            } catch (error) {
                console.error("Error loading appointments:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, navigate]);

    // --- FILTERING LOGIC (FIXED) ---
    const getFilteredAppointments = () => {
        let filtered = appointments.filter(a => {
            const isScheduled = (a.status || "").toLowerCase() === 'scheduled';
            return activeTab === 'active' ? isScheduled : !isScheduled;
        });

        // ✅ FIX: Crash-proof Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(a => {
                const docName = (a.doctorName || "").toLowerCase();
                const spec = (a.specialty || "").toLowerCase();
                return docName.includes(lowerSearch) || spec.includes(lowerSearch);
            });
        }

        if (filterStatus !== "All") {
            filtered = filtered.filter(a => (a.status || "").toLowerCase() === filterStatus.toLowerCase());
        }

        filtered.sort((a, b) => {
            return sortOrder === 'newest' 
                ? b.rawDate - a.rawDate 
                : a.rawDate - b.rawDate;
        });

        return filtered;
    };

    const displayList = getFilteredAppointments();

    const initiateCancel = (appt) => { setSelectedAppt(appt); setShowCancelModal(true); };

    const confirmCancel = async () => {
        if (!selectedAppt) return;
        try {
            await updateAppointment(selectedAppt.id, { status: "cancelled" });
            
            const updatedList = appointments.map(a => 
                a.id === selectedAppt.id ? { ...a, status: "Cancelled" } : a
            );
            
            updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAppointments(updatedList);
            setShowCancelModal(false);

            Swal.fire({
                icon: 'success',
                title: 'Cancelled',
                text: 'Your appointment has been cancelled successfully.',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Cancel Error:", error);
            setShowCancelModal(false);
            Swal.fire({
                icon: 'error',
                title: 'Cancellation Failed',
                text: error.response?.data?.error || "Unable to cancel appointment. Please try again later.",
            });
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

                <div className="controls-bar">
                    <div className="tabs-wrapper">
                        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                            Upcoming
                        </button>
                        <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                            History
                        </button>
                    </div>

                    <div className="filters-wrapper">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search doctor or specialty..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="select-box">
                            <FaFilter className="select-icon" />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <button 
                            className="sort-btn" 
                            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            title="Toggle Sort Order"
                        >
                            {sortOrder === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                        </button>
                    </div>
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
                            {loading ? (
                                <tr><td colSpan="4" className="empty-state">Loading appointments...</td></tr>
                            ) : displayList.length > 0 ? (
                                displayList.map(appt => (
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
                                <tr><td colSpan="4" className="empty-state"><p>No appointments found matching your filters.</p></td></tr>
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