import React, { useState, useEffect } from 'react';
import DoctorSidebar from '../components/DoctorSidebar';
import { useNavigate, Link } from 'react-router-dom';
import { DB_APPOINTMENTS_KEY } from '../data/initDB'; 
import './MyAppointments.css'; 
import './DoctorProfile.css'; 

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [appointments, setAppointments] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [sortOrder, setSortOrder] = useState("newest"); 
    
    const [showReschedule, setShowReschedule] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const name = currentUserEmail.split('@')[0].toLowerCase();
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        
        const myAppts = allAppts.filter(a => 
            (a.doctor && a.doctor.toLowerCase().includes(name)) || 
            (a.doctorName && a.doctorName.toLowerCase().includes(name))
        );
        
        setAppointments(myAppts);
    }, [currentUserEmail, navigate]);

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

    const handleCancel = (id) => {
        if(!window.confirm("Are you sure you want to cancel this appointment?")) return;

        const updatedList = appointments.map(a => 
            a.id === id ? { ...a, status: "Cancelled" } : a
        );
        
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedList));
        setAppointments(updatedList);
    };

    const openReschedule = (appt) => {
        setSelectedAppt(appt);
        setNewDate(appt.date);
        setNewTime(appt.time);
        setShowReschedule(true);
    };

    const submitReschedule = () => {
        const updatedList = appointments.map(a => 
            a.id === selectedAppt.id ? { ...a, date: newDate, time: newTime } : a
        );
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedList));
        setAppointments(updatedList);
        setShowReschedule(false);
    };

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
                    <h1>Manage Appointments</h1>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <select 
                            value={sortOrder} 
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{padding:'10px', borderRadius:'20px', border:'1px solid #ccc', cursor:'pointer'}}
                        >
                            <option value="newest">📅 Newest First</option>
                            <option value="oldest">📅 Oldest First</option>
                        </select>

                        <input 
                            type="text" 
                            placeholder="🔍 Search Patient or Status..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{padding:'10px', borderRadius:'20px', border:'1px solid #ccc', width:'250px'}}
                        />
                    </div>
                </header>

                <div className="appointments-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Details</th>
                                <th>Patient</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppts.length > 0 ? (
                                filteredAppts.map(appt => (
                                    <tr key={appt.id}>
                                        <td>
                                            <strong>{appt.date}</strong> <span style={{color:'#777'}}>at {appt.time}</span>
                                            <div style={{fontSize:'0.85rem', color:'#555', marginTop:'5px', fontStyle:'italic'}}>
                                                "{appt.reason}"
                                            </div>
                                            {appt.uploadedFiles && <span style={{fontSize:'0.8rem', color:'#27AE60'}}>📎 File Attached</span>}
                                        </td>
                                        <td>
                                            <Link to={`/doctor/patient-profile/${appt.patientEmail}`} style={{fontWeight:'bold', color:'#3498DB', textDecoration:'none'}}>
                                                {appt.patientName || "Unknown"} ↗
                                            </Link>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${appt.status.toLowerCase()}`}>{appt.status}</span>
                                        </td>
                                        <td>
                                            {appt.status === 'Scheduled' && (
                                                <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                                                    <button className="btn-action" style={{background:'#27AE60', color:'white'}} onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}>
                                                        Diagnose
                                                    </button>
                                                    <button className="btn-action" style={{background:'#F39C12', color:'white'}} onClick={() => openReschedule(appt)}>
                                                        Reschedule
                                                    </button>
                                                    <button className="btn-action" style={{background:'#E74C3C', color:'white'}} onClick={() => handleCancel(appt.id)}>
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                            {appt.status === 'Completed' && (
                                                <button className="btn-action" style={{background:'#34495E', color:'white'}} onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}>
                                                    View Details
                                                </button>
                                            )}
                                            {appt.status === 'Cancelled' && <span style={{color:'#999'}}>-</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#777'}}>
                                        No appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {showReschedule && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reschedule Appointment</h3>
                        <p>For: {selectedAppt?.patientName}</p>
                        <div style={{textAlign:'left', margin:'20px 0'}}>
                            <label>New Date:</label>
                            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{width:'100%', padding:'8px', marginBottom:'10px'}} />
                            <label>New Time:</label>
                            <select value={newTime} onChange={e => setNewTime(e.target.value)} style={{width:'100%', padding:'8px'}}>
                                <option>09:00 AM</option>
                                <option>10:30 AM</option>
                                <option>01:00 PM</option>
                                <option>03:30 PM</option>
                                <option>05:00 PM</option>
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
                            <button className="btn primary" onClick={submitReschedule}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}