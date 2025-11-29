import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY, DB_PATIENTS_KEY } from '../data/initDB'; 
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

        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const foundPatient = allPatients.find(p => p.email === patientEmail);
        
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
            bloodType: foundPatient ? (foundPatient.bloodType || "Unknown") : "Unknown"
        });

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const relevantHistory = allAppts.filter(appt => 
            appt.patientEmail === patientEmail && 
            (appt.doctor && appt.doctor.toLowerCase().includes(doctorNameKey))
        );

        setHistory(relevantHistory);

    }, [currentUserEmail, patientEmail, navigate]);

    if (!patientInfo) return <div>Loading...</div>;

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <button className="back-btn" onClick={() => navigate('/doctor/appointments')}>← Back to Appointments</button>
                
                <header className="dashboard-header">
                    <h1>Patient Profile</h1>
                </header>

                <div className="profile-content" style={{paddingTop:'0'}}>
                    <div className="profile-card left-card" style={{width:'100%', marginBottom:'30px'}}>
                        <div className="profile-main-info">
                            <div className="profile-text">
                                <h1>{patientInfo.name}</h1>
                                <p style={{color:'#777'}}>{patientInfo.email}</p>
                            </div>
                        </div>
                        <div className="profile-details" style={{display:'flex', gap:'50px', marginTop:'20px'}}>
                            <div><strong>Gender:</strong> {patientInfo.gender}</div>
                            <div><strong>Age:</strong> {patientInfo.age}</div>
                            <div><strong>Blood Type:</strong> <span style={{color:'#C0392B', fontWeight:'bold'}}>{patientInfo.bloodType}</span></div>
                        </div>
                    </div>

                    <div className="reviews-section">
                        <h2>History with You</h2>
                        <div className="reviews-list">
                            {history.length > 0 ? (
                                history.map(h => (
                                    <div key={h.id} className="review-card" style={{borderLeft: h.status === 'Completed' ? '4px solid #27AE60' : '4px solid #F39C12'}}>
                                        <div className="review-header">
                                            <span>{h.date} at {h.time}</span>
                                            <span className={`status-badge ${h.status.toLowerCase()}`}>{h.status}</span>
                                        </div>
                                        <p><strong>Reason:</strong> {h.reason}</p>
                                        {h.diagnosis && <p><strong>Diagnosis:</strong> {h.diagnosis}</p>}
                                        {h.treatmentPlan && <p><strong>Plan:</strong> {h.treatmentPlan}</p>}
                                    </div>
                                ))
                            ) : (
                                <p>No previous history found with this doctor.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}