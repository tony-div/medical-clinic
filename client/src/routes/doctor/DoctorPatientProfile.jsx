import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserInjured, FaVenusMars, FaBirthdayCake, FaHistory, FaCalendarCheck, FaNotesMedical, FaStethoscope } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY, DB_PATIENTS_KEY } from '../../data/initDB';
import './DoctorProfile.css'; 

export default function DoctorPatientProfile() {
    const { patientEmail } = useParams();
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [patientInfo, setPatientInfo] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const doctorNameKey = currentUserEmail.split('@')[0].toLowerCase();

        // 1. Get Patient Profile
        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const foundPatient = allPatients.find(p => p.email === patientEmail);
        
        // 2. Calculate Age
        let calculatedAge = "Unknown";
        if (foundPatient && foundPatient.birth_date) {
            const birthDate = new Date(foundPatient.birth_date);
            const diff = Date.now() - birthDate.getTime();
            const ageDate = new Date(diff);
            calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        setPatientInfo({
            name: foundPatient ? foundPatient.name : "Guest",
            email: patientEmail,
            gender: foundPatient ? foundPatient.gender : "-",
            age: calculatedAge,
        });

        // 3. Get History
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const relevantHistory = allAppts.filter(appt => 
            appt.patientEmail === patientEmail && 
            (appt.doctor && appt.doctor.toLowerCase().includes(doctorNameKey) || 
             appt.doctorName && appt.doctorName.toLowerCase().includes(doctorNameKey))
        );

        relevantHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(relevantHistory);

    }, [currentUserEmail, patientEmail, navigate]);

    // --- Helper for Colors ---
    const getStatusColor = (status) => {
        if (status === 'Cancelled') return '#ef4444'; // Red
        if (status === 'Completed') return '#22c55e'; // Green
        return '#f97316'; // Orange (Scheduled)
    };

    if (!patientInfo) return <div className="loading-state">Loading...</div>;

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            
            <main className="dashboard-main fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1>Patient Profile</h1>
                        <p>Viewing medical history and personal details.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate('/doctor/appointments')}>
                        <FaArrowLeft /> Back to Appointments
                    </button>
                </header>

                {/* ADDED 'stacked' CLASS HERE */}
                <div className="profile-container stacked">
                    
                    {/* PATIENT CARD */}
                    <div className="profile-card">
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder" style={{background: '#3498DB'}}>
                                    <FaUserInjured style={{color:'white'}} />
                                </div>
                                <div>
                                    <h2>{patientInfo.name}</h2>
                                    <span className="user-role">{patientInfo.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid three-col" style={{marginTop: '20px'}}>
                            <div className="input-group">
                                <label><FaVenusMars className="icon"/> Gender</label>
                                <div className="read-only-field capitalize">{patientInfo.gender}</div>
                            </div>
                            <div className="input-group">
                                <label><FaBirthdayCake className="icon"/> Age</label>
                                <div className="read-only-field">{patientInfo.age} Years</div>
                            </div>
                            <div className="input-group">
                                <label><FaHistory className="icon"/> Total Visits</label>
                                <div className="read-only-field">{history.length}</div>
                            </div>
                        </div>
                    </div>

                   {/* HISTORY SECTION */}
                    <div className="reviews-section" style={{marginTop: '0'}}>
                        <h2><FaHistory /> Medical History with You</h2>
                        
                        {history.length > 0 ? (
                            // --- IMPORTANT: This div creates the horizontal row ---
                            <div className="history-list">
                                {history.map(h => (
                                    <div 
                                        key={h.id} 
                                        className="review-card" 
                                        // Dynamic Border Color Logic
                                        style={{borderLeft: `5px solid ${getStatusColor(h.status)}`}} 
                                    >
                                        <div className="review-header">
                                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                                <FaCalendarCheck style={{color:'#64748b'}}/>
                                                <span>{h.date} at {h.time}</span>
                                            </div>
                                            {/* Dynamic Badge Class */}
                                            <span className={`status-badge-large ${h.status.toLowerCase()}`}>
                                                {h.status}
                                            </span>
                                        </div>
                                        
                                        <div className="history-details" style={{marginTop:'15px'}}>
                                            <div className="detail-item">
                                                <strong><FaNotesMedical className="icon"/> Reason:</strong> {h.reason}
                                            </div>
                                            {h.diagnosis && (
                                                <div className="detail-item">
                                                    <strong><FaStethoscope className="icon"/> Diagnosis:</strong> {h.diagnosis}
                                                </div>
                                            )}
                                            {h.treatmentPlan && (
                                                <div className="detail-item">
                                                    <strong>📝 Plan:</strong> {h.treatmentPlan}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No previous history found with this patient.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}