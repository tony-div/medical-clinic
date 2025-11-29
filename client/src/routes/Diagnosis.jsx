import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY } from '../data/initDB';
import './DoctorProfile.css'; 

export default function Diagnosis() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    
    const [appt, setAppt] = useState(null);
    const [formData, setFormData] = useState({
        diagnosis: "",
        prescription: "",
        treatmentPlan: "" 
    });

    useEffect(() => {
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const current = allAppts.find(a => a.id === Number(appointmentId));
        if (current) {
            setAppt(current);
            if(current.status === 'Completed') {
                setFormData({
                    diagnosis: current.diagnosis || "",
                    prescription: current.prescription || "",
                    treatmentPlan: current.treatmentPlan || ""
                });
            }
        } else {
            navigate('/doctor/appointments');
        }
    }, [appointmentId, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        
        const updatedAppts = allAppts.map(a => {
            if (a.id === Number(appointmentId)) {
                return {
                    ...a,
                    status: "Completed",
                    diagnosis: formData.diagnosis,
                    prescription: formData.prescription,
                    treatmentPlan: formData.treatmentPlan 
                };
            }
            return a;
        });

        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedAppts));
        alert("Diagnosis Saved!");
        navigate('/doctor/appointments');
    };

    if (!appt) return <div>Loading...</div>;

    const isReadOnly = appt.status === 'Completed' || appt.status === 'Cancelled';

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>{isReadOnly ? "Appointment Details" : "Diagnosis & Treatment"}</h1>
                    <p>Patient: <strong>{appt.patientName}</strong> | Status: <span style={{color: isReadOnly ? '#27AE60' : '#F39C12', fontWeight:'bold'}}>{appt.status}</span></p>
                </header>

                <div className="booking-card" style={{maxWidth:'800px', margin:'0 auto'}}>
                    
                    <div style={{background:'#EBF5FB', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
                        <h4 style={{marginTop:0, color:'#2C3E50'}}>📌 Patient Information</h4>
                        <p><strong>Reason for Visit:</strong> {appt.reason}</p>
                        <p><strong>Uploaded Tests:</strong> 
                            {appt.uploadedFiles ? 
                                <a href={appt.uploadedFiles} target="_blank" rel="noreferrer" style={{color:'#3498DB', marginLeft:'5px'}}>📄 View Attached Document</a> 
                                : <span style={{color:'#777', marginLeft:'5px'}}>No files uploaded.</span>
                            }
                        </p>
                    </div>

                    <div className="booking-header">Doctor's Report</div>
                    
                    <form className="booking-body" onSubmit={handleSubmit}>
                        <div className="form-section" style={{marginBottom:'20px'}}>
                            <label style={{fontWeight:'bold'}}>Diagnosis / Condition</label>
                            <input 
                                type="text" 
                                className="date-input"
                                value={formData.diagnosis}
                                disabled={isReadOnly} 
                                onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-section" style={{marginBottom:'20px'}}>
                            <label style={{fontWeight:'bold'}}>Prescription (Rx)</label>
                            <textarea 
                                rows="3"
                                className="date-input"
                                value={formData.prescription}
                                disabled={isReadOnly}
                                onChange={e => setFormData({...formData, prescription: e.target.value})}
                                required
                            ></textarea>
                        </div>

                        <div className="form-section" style={{marginBottom:'20px'}}>
                            <label style={{fontWeight:'bold'}}>Treatment Plan & Notes</label>
                            <textarea 
                                rows="4"
                                className="date-input"
                                value={formData.treatmentPlan}
                                disabled={isReadOnly}
                                onChange={e => setFormData({...formData, treatmentPlan: e.target.value})}
                            ></textarea>
                        </div>

                        {!isReadOnly && (
                            <button type="submit" className="book-btn-large">
                                ✅ Save & Complete Visit
                            </button>
                        )}
                        
                        {isReadOnly && (
                            <button type="button" className="btn secondary" style={{width:'100%'}} onClick={() => navigate('/doctor/appointments')}>
                                ← Back to List
                            </button>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}