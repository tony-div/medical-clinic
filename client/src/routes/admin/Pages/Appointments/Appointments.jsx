import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { DB_APPOINTMENTS_KEY, DB_DOCTORS_KEY } from '../../../../data/initDB'; // Not needed if using API

import './Appointments.css';

import { getAppointments } from '../../../../services/appointment.js'
import { getDoctors } from '../../../../services/doctors.js'
import { getAllUsers } from '../../../../services/users.js'

const Appointments = () => {
    const navigate = useNavigate();

    // --- 1. State ---
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]); 

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Doctor');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [dateRange, setDateRange] = useState('');
    // const [patientsList, setPatientsList] = useState([]); // Unused state removed for cleanup

    // --- 2. Load Data ---
    const refreshData = async () => {
        try {
            const [resAppts, resDocs, resUsers] = await Promise.all([
                getAppointments(),
                getDoctors(),
                getAllUsers()
            ]);

            const rawAppts = resAppts.data.appointments || [];
            const docs = resDocs.data.data || [];
            const users = resUsers.data.users || [];

            // --- THE FIX: Create enrichedAppts by mapping over rawAppts ---
            const enrichedAppts = rawAppts.map(appt => {
                const doctor = docs.find(d => d.id === appt.doctor_id);
                const patient = users.find(u => u.id === appt.user_id);

                // Helper to Capitalize status (api: "complete" -> ui: "Completed")
                const normalizeStatus = (s) => {
                    if (!s) return 'Scheduled';
                    const lower = s.toLowerCase();
                    if (lower === 'complete' || lower === 'completed') return 'Completed';
                    if (lower === 'cancel' || lower === 'cancelled') return 'Cancelled';
                    return 'Scheduled';
                };

                return {
                    ...appt,
                    // Map API fields to UI fields
                    time: appt.starts_at ? appt.starts_at.substring(0, 5) : '00:00', // Extract HH:MM
                    doctorName: doctor ? doctor.name : 'Unknown Doctor',
                    patientName: patient ? patient.name : 'Unknown Patient',
                    patientEmail: patient ? patient.email : '',
                    patientId: patient ? patient.id : null, // Store ID for navigation
                    status: normalizeStatus(appt.status) // Normalize status string
                };
            });

            // Sort by Date (Newest first)
            enrichedAppts.sort((a, b) => new Date(b.date) - new Date(a.date));

            setAppointments(enrichedAppts);
            setFilteredAppointments(enrichedAppts);
            setDoctorsList(docs);

        } catch (err) {
            console.error("Failed to load appointments list", err);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- 3. Filter Logic ---
    useEffect(() => {
        let results = [...appointments];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(appt => {
                if (roleFilter === 'Doctor') {
                    return (appt.doctorName || '').toLowerCase().includes(term);
                } else {
                    return (appt.patientName || '').toLowerCase().includes(term);
                }
            });
        }

        // Status Filter
        if (selectedStatus && selectedStatus !== 'All') {
            results = results.filter(appt => appt.status === selectedStatus);
        }

        // Date Range
        if (dateRange) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            results = results.filter(appt => {
                const apptDate = new Date(appt.date);
                if (dateRange === 'Today') {
                    return apptDate.toDateString() === today.toDateString();
                } else if (dateRange === '7 Days') {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return apptDate >= sevenDaysAgo && apptDate <= today;
                } else if (dateRange === 'Month') {
                    return apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
                }
                return true;
            });
        }

        setFilteredAppointments(results);
    }, [searchTerm, roleFilter, selectedStatus, dateRange, appointments]);

    // Helper for Status Colors
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled': return 'status-scheduled';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // --- 4. Navigation Handlers ---

    // Updated: Accepts ID directly
    const goToPatient = (patientId) => {
        if (patientId) {
            navigate(`/users/${patientId}`, { state: { returnTab: 'appointments' } });
        }
    };

    const goToDoctor = (docId) => {
        if (docId) {
            navigate(`/doctors/profile/${docId}`, { state: { returnTab: 'appointments' } });
        }
    };

    return (
        <div className="appointments-page">
            <div className="page-header">
                <h2>Appointments</h2>

                {/* Search Bar */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        className="filter-select"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{ width: '100px' }}
                    >
                        <option value="Doctor">Doctor</option>
                        <option value="Patient">Patient</option>
                    </select>

                    <input
                        type="text"
                        className="filter-input"
                        placeholder={`Search ${roleFilter} name...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '250px' }}
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="filters-container">
                <div className="filter-group">
                    <label>Status</label>
                    <select className="filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Date Range</label>
                    <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="">All Dates</option>
                        <option value="Today">Today</option>
                        <option value="7 Days">Last 7 Days</option>
                        <option value="Month">This Month</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Patient</th>
                            <th>Doctor</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appt) => (
                                <tr key={appt.id}>
                                    {/* Format Date: YYYY-MM-DD -> Locale Date */}
                                    <td>{new Date(appt.date).toLocaleDateString()}</td>
                                    <td>{appt.time}</td>

                                    {/* CLICKABLE PATIENT NAME */}
                                    <td>
                                        <span
                                            className="clickable-link"
                                            onClick={() => goToPatient(appt.patientId)} // Pass ID directly
                                            style={{ color: '#3498DB', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {appt.patientName}
                                        </span>
                                    </td>

                                    {/* CLICKABLE DOCTOR NAME */}
                                    <td>
                                        <span
                                            className="clickable-link"
                                            onClick={() => goToDoctor(appt.doctor_id)} // Use API doctor_id
                                            style={{ color: '#3498DB', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {appt.doctorName}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`status-badge ${getStatusClass(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="actions-cell">
                                            {appt.status === 'Completed' ? (
                                                <button
                                                    className="btn-outline"
                                                    style={{ borderColor: '#3498DB', color: '#3498DB' }}
                                                    onClick={() => navigate(`/admin/appointment/${appt.id}`)}
                                                >
                                                    View Report
                                                </button>
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '0.85rem' }}>-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    No appointments found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments;